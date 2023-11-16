<script context="module" lang="ts">
	import { InputController } from '../Infrastructure/InputController';
	import type { OutputController } from '../Infrastructure/OutputController';
	import type { ComponentMetadata } from '../Infrastructure/uimf';

	export class Controller extends InputController<IValueList> {
		declare metadata: Metadata;

		public deserialize(value: string): Promise<IValueList> {
			var result = JSON.parse(value);
			return Promise.resolve(result);
		}

		public serialize(value: IValueList): string | null {
			return value != null && value.Items?.length > 0 ? JSON.stringify(value) : null;
		}

		public async getValue(): Promise<IValueList> {
			var items = this.value?.Items || [];
			var resultItems: IValueItem[] = [];

			var promises = [];

			for (let item of items.filter((t) => !t._deleted)) {
				let dto: IValueItem = {
					_controllers: {},
					_deleted: null
				};

				resultItems.push(dto);

				for (let [key, controller] of Object.entries(item._controllers)) {
					if (controller instanceof InputController) {
						promises.push(
							controller.getValue().then(function (value) {
								dto[key] = value;
							})
						);
					}
				}
			}

			await Promise.all(promises);

			return Promise.resolve({ Items: resultItems });
		}

		protected setValueInternal(value: IValueList | null): Promise<void> {
			return Promise.resolve();
		}
	}

	interface IValueList {
		Items: IValueItem[];
	}

	interface IValueItem {
		[other: string]: unknown;
		_controllers: Record<string, InputController<any> | OutputController<any>>;
		_deleted: boolean | null;
	}

	interface Metadata extends ComponentMetadata {
		CustomProperties: {
			Fields: IField[];
			CanRemove?: boolean;
			CanAdd?: boolean;
		};
	}

	interface IField {
		IsInput: boolean;
		Metadata: ComponentMetadata;
	}
</script>

<script lang="ts">
	import { InputComponent } from '../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import { beforeUpdate, tick } from 'svelte';
	import Input from '../Input.svelte';
	import { tooltip } from '../Components/Tooltip.svelte';
	import Output from '../Output.svelte';

	export let controller: Controller;

	let rows: IValueItem[] = [];
	let columns: IField[] = [];
	let metadata: Metadata | null = null;
	let hasDropdowns: boolean = false;

	const component = new InputComponent({
		init() {
			metadata = controller.metadata;

			hasDropdowns = false;

			columns = controller.metadata.CustomProperties.Fields.map((t) => {
				hasDropdowns ||= ['typeahead', 'multiselect', 'dropdown'].includes(t.Metadata.Type);

				return t;
			}).sort((a, b) => a.Metadata.OrderIndex - b.Metadata.OrderIndex);

			controller.ready?.resolve();
		},
		async refresh() {
			// Make sure that `field.value.Items` has a non-null value.
			// This is important to ensure that the newly-added items
			// can be retrieved (and POSTed).
			controller.value = {
				Items: controller.value?.Items ?? []
			};

			for (let row of controller.value.Items) {
				row._controllers = row._controllers || {};

				for (let column of columns) {
					if (row._controllers[column.Metadata.Id] == null) {
						row._controllers[column.Metadata.Id] = await getController(column, row);
					}

					if (column.IsInput) {
						const inputController = row._controllers[column.Metadata.Id] as InputController<any>;
						const currentValue = inputController.getValue();

						// To avoid unnecessary re-rendering and DOM events, we only update
						// the value if it has actually changed.
						if (row[column.Metadata.Id] != currentValue) {
							await inputController.setValue(row[column.Metadata.Id]);
						}
					}
				}
			}

			rows = controller.value?.Items || [];
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	async function addNewRow(e: Event): Promise<void> {
		var newRow: IValueItem = {
			_controllers: {},
			_deleted: false
		};

		for (let column of columns) {
			newRow._controllers[column.Metadata.Id] = await getController(column, newRow);
		}

		rows.push(newRow);
		rows = rows;

		// Let's wait for the DOM to update.
		await tick();

		// Then focus on the first input in the new row.
		const input: HTMLInputElement | null | undefined = (e.target as HTMLButtonElement)
			.closest('table')
			?.querySelector('tbody > tr:last-child > td:first-child input');

		input?.focus();
	}

	async function getController(
		column: IField,
		row: IValueItem
	): Promise<InputController<any> | OutputController<any>> {
		if (column.IsInput) {
			var inputController = controlRegister.createInput({
				app: controller.app,
				form: controller.form,
				metadata: column.Metadata,
				defer: null
			}).controller;

			// When the cell value changes, the overall `value-list` should
			// also trigger the `input:change` event.
			inputController.on('input:change', async () => {
				row[column.Metadata.Id] = inputController.getValue();
			});

			return inputController;
		} else {
			return controlRegister.createOutput({
				app: controller.app,
				form: controller.form,
				metadata: column.Metadata,
				data: row[column.Metadata.Id]
			}).controller;
		}
	}

	function getColumnWidth(item: ComponentMetadata) {
		switch (item.Type) {
			default:
				return 'min-width: 200px';
		}
	}
</script>

{#if rows != null && metadata != null}
	<div class="table-responsive" class:has-dropdowns={hasDropdowns}>
		<table class="table table-borderless table-sm">
			<thead>
				<tr>
					{#each columns as column}
						<th
							style={getColumnWidth(column.Metadata)}
							use:tooltip={column.Metadata.CustomProperties?.Documentation}
							>{column.Metadata.Label}</th
						>
					{/each}
					{#if metadata.CustomProperties.CanRemove || metadata.CustomProperties.CanAdd}
						<th />
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each rows.filter((t) => !t._deleted) as row}
					<tr>
						{#each columns as column}
							<td class={column.Metadata.CustomProperties?.ColumnCssClass}>
								{#if column.IsInput}
									<Input controller={row._controllers[column.Metadata.Id]} hideLabel={true} />
								{:else}
									<Output controller={row._controllers[column.Metadata.Id]} hideLabel={true} />
								{/if}
							</td>
						{/each}
						{#if metadata.CustomProperties.CanRemove == true}
							<td class="col-action">
								<button
									class="btn btn-outline-light"
									type="button"
									use:tooltip={'Remove row'}
									on:click|preventDefault={() => (row._deleted = true)}
								>
									<i class="fa fa-times" />
								</button>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
			{#if metadata.CustomProperties.CanAdd}
				<tfoot>
					<tr>
						<td colspan={columns.length} />
						<td class="col-action">
							<button
								class="btn btn-outline-primary"
								type="button"
								use:tooltip={'Add row'}
								on:click|preventDefault={addNewRow}
							>
								<i class="fa fa-plus" />
							</button>
						</td>
					</tr>
				</tfoot>
			{/if}
		</table>
	</div>
{/if}

<style lang="scss">
	.table-responsive {
		width: 100%;
	}

	.has-dropdowns {
		// Add padding to account for typeahead, dropdown or any other input
		// that can grow vertically.
		padding-bottom: 18rem;
	}

	.col-action {
		width: 1px;
	}
</style>
