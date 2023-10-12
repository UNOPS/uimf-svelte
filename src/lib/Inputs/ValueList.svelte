<script context="module" lang="ts">
	import { InputController } from '../Infrastructure/InputController';
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
					promises.push(
						controller.getValue().then(function (value) {
							dto[key] = value;
						})
					);
				}
			}

			await Promise.all(promises);

			return Promise.resolve({ Items: resultItems });
		}
	}

	interface IValueList {
		Items: IValueItem[];
	}

	interface IValueItem {
		[other: string]: unknown;
		_controllers: Record<string, InputController<any>>;
		_deleted: boolean | null;
	}

	interface Metadata extends ComponentMetadata {
		CanRemove?: boolean;
		CanAdd?: boolean;
		CustomProperties: {
			Metadata: ComponentMetadata[];
		};
	}
</script>

<script lang="ts">
	import { InputComponent } from '../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import { beforeUpdate } from 'svelte';
	import Input from '../Input.svelte';
	import { tooltip } from '../Components/Tooltip.svelte';

	export let controller: Controller;

	let rows: IValueItem[] = [];
	let columns: ComponentMetadata[] = [];
	let metadata: Metadata | null = null;
	let hasDropdowns: boolean = false;

	const component = new InputComponent({
		async init() {
			metadata = controller.metadata;

			hasDropdowns = false;
			columns = (controller.metadata.CustomProperties?.Metadata || [])
				.map((t) => {
					hasDropdowns = hasDropdowns || ['typeahead', 'multiselect', 'dropdown'].includes(t.Type);
					return t;
				})
				.sort((a, b) => a.OrderIndex - b.OrderIndex);

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
					row._controllers[column.Id] = await getInputController(column, row);
				}
			}

			rows = controller.value.Items;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	async function createNewRow(columns: ComponentMetadata[]): Promise<IValueItem> {
		var row: IValueItem = {
			_controllers: {},
			_deleted: false
		};

		for (let column of columns) {
			row._controllers[column.Id] = await getInputController(column, row);
		}

		return row;
	}

	async function getInputController(
		item: ComponentMetadata,
		data: any
	): Promise<InputController<any>> {
		var inputController = controlRegister.createInput({
			app: controller.app,
			form: controller.form,
			metadata: item,
			defer: null
		}).controller;

		await inputController.setValue(data[item.Id]);
		return inputController;
	}

	function getColumnWidth(item: ComponentMetadata) {
		switch (item.Type) {
			default:
				return 'min-width: 200px';
		}
	}
</script>

{#if rows != null}
	<div class="table-responsive" class:has-dropdowns={hasDropdowns}>
		<table class="table table-borderless table-sm">
			<thead>
				<tr>
					{#each columns as column}
						<th style={getColumnWidth(column)} use:tooltip={column.CustomProperties?.Documentation}
							>{column.Label}</th
						>
					{/each}
					{#if metadata?.CanRemove || metadata?.CanAdd}
						<th />
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each rows.filter((t) => !t._deleted) as row}
					<tr>
						{#each columns as column}
							<td class={column.CustomProperties?.ColumnCssClass}>
								<Input controller={row._controllers[column.Id]} hideLabel={true} />
							</td>
						{/each}
						{#if metadata?.CanRemove == true}
							<td class="col-action">
								<button
									class="btn btn-outline-light"
                                    use:tooltip={"Remove row"}
									on:click={(e) => {
										row._deleted = true;
										e.preventDefault();
									}}
								>
									<i class="fa fa-times" />
								</button>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
			{#if metadata?.CanAdd}
				<tfoot>
					<tr>
						<td colspan={columns.length} />
						<td class="col-action">
							<button
								class="btn btn-outline-primary"
                                use:tooltip={"Add row"}
								on:click={async (e) => {
									var newRow = await createNewRow(columns);
									rows.push(newRow);
									rows = rows;

									e.preventDefault();
								}}
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
