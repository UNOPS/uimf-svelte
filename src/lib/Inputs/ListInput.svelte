<script context="module" lang="ts">
	import { InputController, type CreateInputOptions } from '../Infrastructure/InputController';
	import type { OutputController } from '../Infrastructure/OutputController';
	import type { IFieldMetadata, IInputFieldMetadata } from '../Infrastructure/uimf';

	export class Controller extends InputController<
		IListInputData,
		IInputFieldMetadata<IListInputConfiguration>
	> {
		public table: Table;

		constructor(options: CreateInputOptions<IInputFieldMetadata<IListInputConfiguration>>) {
			super(options);

			this.table = this.createTable();
		}

		public deserialize(value: string): Promise<IListInputData> {
			var result = JSON.parse(value);
			return Promise.resolve(result);
		}

		public serialize(value: IListInputData): string | null {
			return value != null && value.Items?.length > 0 ? JSON.stringify(value) : null;
		}

		public async getValue(): Promise<IListInputData> {
			const promises = [];
			const rowDatas: Record<string, any>[] = [];

			for (const row of this.table.body) {
				if (row.deleted) {
					continue;
				}

				const rowData: Record<string, any> = {};
				rowDatas.push(rowData);

				for (const column of this.metadata.Component.Configuration.Fields.filter(
					(t) => t.IsInput
				)) {
					var cell = this.table.controller(row, column.Metadata.Id) as InputController<any>;

					let promise = cell.getValue().then((t) => {
						rowData[column.Metadata.Id] = t;
					});

					promises.push(promise);
				}
			}

			await Promise.all(promises);

			var items = this.metadata.Component.Configuration.IsPrimitive
				? rowDatas.map((t) => t[this.metadata.Component.Configuration.Fields[0].Metadata.Id])
				: rowDatas;

			return Promise.resolve({ Items: items });
		}

		protected async setValueInternal(value: IListInputData | null): Promise<void> {
			// Make sure that `field.value.Items` has a non-null value.
			// This is important to ensure that the newly-added items
			// can be retrieved (and POSTed).
			this.value = {
				Items: value?.Items ?? []
			};

			this.table = this.createTable();

			const items = this.value.Items.map((item) => {
				if (this.metadata.Component.Configuration.IsPrimitive === true) {
					return { [this.metadata.Component.Configuration.Fields[0].Metadata.Id]: item };
				}

				return { ...item };
			});

			await this.table.setData(items);
		}

		private createTable(): Table {
			return new Table({
				parent: this,
				columns: this.metadata.Component.Configuration.Fields,
				extensions: [],
				inputOnChange: async (row, cell) => {
					// When the cell value changes, the overall `list-input` should also be updated.
					await cell.getValue().then((value) => {
						if (this.metadata.Component.Configuration.IsPrimitive) {
							this.value!.Items[row.index] = value;
						} else {
							this.value!.Items[row.index][cell.metadata.Id] = value;
						}
					});
				}
			});
		}
	}

	interface IListInputData {
		Items: any[] | number[] | string[];
	}

	export interface IListInputConfiguration {
		AddRowLabel?: string;
		RemoveRowLabel?: string;
		Fields: IField[];
		CanRemove?: boolean;
		CanAdd?: boolean;

		/**
		 * The name of the field inside response that contains the default row value.
		 * If null the newly created rows will be initialized without any of its
		 * fields pre-set.
		 */
		DefaultRowValue?: string;

		/**
		 * If true, the list-input is an array of primitives (e.g. numbers or strings).
		 * If false, the list-input is an array of objects where each object has a
		 * collection of inputs/outputs.
		 */
		IsPrimitive: boolean;
	}
</script>

<script lang="ts">
	import { InputComponent } from '../Infrastructure/Component';
	import { beforeUpdate, tick } from 'svelte';
	import Input from '../Input.svelte';
	import { tooltip } from '../Components/Tooltip.svelte';
	import Output from '../Output.svelte';
	import { Table, TableBodyCell, TableRowGroup } from '../Outputs/Table';
	import type { IField } from '../Outputs/Table/IColumn';

	export let controller: Controller;

	let metadata: IFieldMetadata<IListInputConfiguration> | null = null;
	let table: Table | null = null;

	const component = new InputComponent({
		init() {
			metadata = controller.metadata;
		},
		async refresh() {
			table = controller.table;

			table.on('input:change', function (e) {
				table = table;
			});
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	async function addNewRow(e: Event): Promise<void> {
		if (table == null) {
			throw 'Cannot add row to a `null` table.';
		}

		let defaultRowValue = {};
		const config = controller.metadata.Component.Configuration;

		if (config.DefaultRowValue != null && controller.form?.response != null) {
			defaultRowValue = controller.form.response[config.DefaultRowValue]?.value ?? {};
		}

		table.addRow(defaultRowValue);
		table.body = table.body;

		// Let's wait for the DOM to update.
		await tick();

		// Then focus on the first input in the new row.
		const input: HTMLInputElement | null | undefined = (e.target as HTMLButtonElement)
			.closest('table')
			?.querySelector('tbody > tr:last-child > td:first-child input');

		input?.focus();
	}

	function getControllerOrException<T extends InputController<any> | OutputController<any>>(
		row: TableRowGroup<TableBodyCell>,
		column: TableBodyCell
	): T {
		return controller.table?.controller(row, column.controller.metadata.Id) as T;
	}
</script>

{#if metadata != null && table != null && (table.body.length > 0 || metadata.Component.Configuration.CanRemove || metadata.Component.Configuration.CanAdd)}
	{#each table.body.filter((t) => !t.deleted) as rowGroup}
		<div class="item mb-3">
			{#if metadata.Component.Configuration.CanRemove}
				<div class="buttons">
					<button
						type="button"
						on:click|preventDefault={() => {
							rowGroup.deleted = true;
							table = table;
						}}
					>
						{metadata.Component.Configuration.RemoveRowLabel ?? 'Remove item'}
					</button>
				</div>
			{/if}

			<div class="inputs">
				{#each rowGroup.main.cells as cell}
					{#if cell.isInput}
						<Input controller={getControllerOrException(rowGroup, cell)} />
					{:else}
						<Output controller={getControllerOrException(rowGroup, cell)} />
					{/if}
				{/each}
			</div>
		</div>
	{/each}

	{#if metadata.Component.Configuration.CanAdd}
		<div class="item">
			<div class="buttons">
				<button type="button" on:click|preventDefault={addNewRow}>
					{metadata.Component.Configuration.AddRowLabel ?? 'Add item'}
				</button>
			</div>
		</div>
	{/if}
{:else}
	<div>No items found.</div>
{/if}

<style lang="scss">
	@import '../scss/styles.variables.scss';

	.item {
		border-left: 5px solid #a9d0ef;

		& > .inputs {
			padding: 15px 0 5px 15px;
			display: grid;
			grid-template-columns: 1fr;
			grid-gap: 10px;
			margin-bottom: 20px;
		}

		& > .buttons {
			padding: 0px 15px;
			background-color: #e7f4ff;

			& > button {
				background: transparent;
				font-weight: bold;
				text-align: left;
				line-height: 3em;
				border: none;
				min-width: 100px;
			}

			& > button:hover {
				text-decoration: underline;
			}
		}
	}
</style>
