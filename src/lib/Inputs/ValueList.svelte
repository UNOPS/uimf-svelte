<script context="module" lang="ts">
	import { InputController } from '../Infrastructure/InputController';
	import type { OutputController } from '../Infrastructure/OutputController';
	import type { ComponentMetadata } from '../Infrastructure/uimf';

	export class Controller extends InputController<IValueList, Metadata> {
		public rows: Row[] = [];

		public deserialize(value: string): Promise<IValueList> {
			var result = JSON.parse(value);
			return Promise.resolve(result);
		}

		public serialize(value: IValueList): string | null {
			return value != null && value.Items?.length > 0 ? JSON.stringify(value) : null;
		}

		public async getValue(): Promise<IValueList> {
			const promises = [];
			const rowDatas: Record<string, any>[] = [];

			for (const row of this.rows) {
				if (row._deleted) {
					continue;
				}

				const rowData: Record<string, any> = {};
				rowDatas.push(rowData);

				for (const column of this.metadata.CustomProperties.Fields) {
					var cell = row._controllers[column.Metadata.Id];

					if (cell instanceof InputController) {
						let promise = cell.getValue().then((t) => {
							rowData[column.Metadata.Id] = t;
						});

						promises.push(promise);
					}
				}
			}

			await Promise.all(promises);

			var items = this.metadata.CustomProperties.IsPrimitive
				? rowDatas.map((t) => t[this.metadata.CustomProperties.Fields[0].Metadata.Id])
				: rowDatas;

			return Promise.resolve({ Items: items });
		}

		protected async setValueInternal(value: IValueList | null): Promise<void> {
			// Make sure that `field.value.Items` has a non-null value.
			// This is important to ensure that the newly-added items
			// can be retrieved (and POSTed).
			this.value = {
				Items: value?.Items ?? []
			};

			this.rows = [];

			for (let rowIndex = 0; rowIndex < this.value.Items.length; ++rowIndex) {
				const row: Row = {
					index: rowIndex,
					_controllers: {},
					_deleted: false
				};

				this.rows[rowIndex] = row;

				for (let column of this.metadata.CustomProperties.Fields) {
					row._controllers[column.Metadata.Id] = await this.getNestedController(column, row);

					if (column.IsInput) {
						const inputController = row._controllers[column.Metadata.Id] as InputController<any>;

						const innerValue = this.metadata.CustomProperties.IsPrimitive
							? this.value.Items[rowIndex]
							: this.value.Items[rowIndex][column.Metadata.Id];

						await inputController.setValue(innerValue);
					}
				}
			}
		}

		async getNestedController(
			column: IField,
			row: Row
		): Promise<InputController<any> | OutputController<any>> {
			if (column.IsInput) {
				var inputController = controlRegister.createInput({
					app: this.app,
					form: this.form,
					metadata: column.Metadata,
					defer: null
				}).controller;

				// When the cell value changes, the overall `value-list` should
				// also trigger the `input:change` event.
				inputController.on('input:change', async () => {
					await inputController.getValue().then((value) => {
						if (this.metadata.CustomProperties.IsPrimitive) {
							this.value!.Items[row.index] = value;
						} else {
							this.value!.Items[row.index][column.Metadata.Id] = value;
						}
					});
				});

				return inputController;
			} else {
				return controlRegister.createOutput({
					app: this.app,
					form: this.form,
					metadata: column.Metadata,
					data: this.value!.Items[row.index][column.Metadata.Id]
				}).controller;
			}
		}
	}

	export interface IValueList {
		Items: any[] | number[] | string[];
	}

	export interface Row {
		index: number;
		_controllers: Record<string, InputController<any> | OutputController<any>>;
		_deleted: boolean | null;
	}

	interface Metadata extends ComponentMetadata {
		CustomProperties: {
			Fields: IField[];
			CanRemove?: boolean;
			CanAdd?: boolean;
			GroupBy?: string;

			/**
			 * If true, the value-list is an array of primitives (e.g. numbers or strings).
			 * If false, the value-list is an array of objects where each object has a
			 * collection of inputs/outputs.
			 */
			IsPrimitive: boolean;
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

	let rows: Row[] = [];
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
			rows = controller.rows || [];
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	async function addNewRow(e: Event): Promise<void> {
		const newRow: Row = {
			index: rows.length,
			_controllers: {},
			_deleted: false
		};

		for (let column of columns) {
			newRow._controllers![column.Metadata.Id] = await controller.getNestedController(
				column,
				newRow
			);
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

	function getColumnWidth(item: ComponentMetadata) {
		switch (item.Type) {
			default:
				return 'min-width: 200px';
		}
	}

	function getControllerOrException<T extends InputController<any> | OutputController<any>>(
		row: Row,
		column: IField
	): T {
		if (row._controllers == null || row._controllers[column.Metadata.Id] == null) {
			throw `Cannot find controller for column '${column.Metadata.Id}'.`;
		}

		return row._controllers[column.Metadata.Id] as T;
	}
</script>

{#if rows != null && metadata != null}
	<div class="table-responsive" class:has-dropdowns={hasDropdowns}>
		<table class="table table-borderless table-sm">
			<thead>
				<tr>
					{#each columns as column}
						{#if !column.Metadata.Hidden}
							<th
								style={getColumnWidth(column.Metadata)}
								use:tooltip={column.Metadata.CustomProperties?.Documentation}
								>{column.Metadata.Label}</th
							>
						{/if}
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
							{#if !column.Metadata.Hidden}
								<td class={column.Metadata.CustomProperties?.ColumnCssClass}>
									{#if column.IsInput}
										<Input controller={getControllerOrException(row, column)} hideLabel={true} />
									{:else}
										<Output controller={getControllerOrException(row, column)} hideLabel={true} />
									{/if}
								</td>
							{/if}
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
