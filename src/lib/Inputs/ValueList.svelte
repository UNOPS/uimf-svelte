<script context="module" lang="ts">
	import { InputController, type CreateInputOptions } from '../Infrastructure/InputController';
	import type { OutputController } from '../Infrastructure/OutputController';
	import type { IFieldMetadata, IInputFieldMetadata } from '../Infrastructure/uimf';

	export class Controller extends InputController<
		IValueList,
		IInputFieldMetadata<ValueListConfiguration>
	> {
		public table: Table;

		constructor(options: CreateInputOptions<IInputFieldMetadata<ValueListConfiguration>>) {
			super(options);

			this.table = this.createTable();
		}

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

		protected async setValueInternal(value: IValueList | null): Promise<void> {
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
			if (this.metadata.Component.Configuration.Row != null) {
				// ValueList stores row metadata in component configuration,
				// but `RowExtension` (which processes it) expects this metadata
				// to be in `CustomProperties.row`. So we move it. A bit ugly,
				// but no harm done.
				this.metadata.CustomProperties = this.metadata.CustomProperties ?? {};
				this.metadata.CustomProperties.row = this.metadata.Component.Configuration.Row;
			}

			return new Table({
				parent: this,
				columns: this.metadata.Component.Configuration.Fields,
				extensions: [
					new ExpandableExtension(),
					new DocumentationExtension(),
					new ColumnExtension(),
					new RowExtension(),
					new ActionListColumnExtension(),
					new ValueListExtension()
				],
				inputOnChange: async (row, cell) => {
					// When the cell value changes, the overall `value-list` should also be updated.
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

	export interface IValueList {
		Items: any[] | number[] | string[];
	}

	export interface Row {
		index: number;
		_controllers: Record<string, InputController<any> | OutputController<any>>;
		_deleted: boolean | null;
	}

	export interface ValueListConfiguration {
		Fields: IField[];
		CanRemove?: boolean;
		CanAdd?: boolean;

		/**
		 * The name of the field inside response that contains the default row value.
		 * If null the newly created rows will be initialized without any of its
		 * fields pre-set.
		 */
		DefaultRowValue?: string;

		Row: { GroupBy?: string };

		/**
		 * If true, the value-list is an array of primitives (e.g. numbers or strings).
		 * If false, the value-list is an array of objects where each object has a
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
	import { DocumentationExtension } from '../Outputs/Table/Extensions/DocumentationExtension';
	import { ColumnExtension } from '../Outputs/Table/Extensions/ColumnExtension';
	import { RowExtension } from '../Outputs/Table/Extensions/RowExtension';
	import { ActionListColumnExtension } from '../Outputs/Table/Extensions/ActionListColumnExtension';
	import type { IField } from '../Outputs/Table/IColumn';
	import { ValueListExtension } from '../Outputs/Table/Extensions/ValueListExtension';
	import { ExpandableExtension } from '../Outputs/Table/Extensions/ExpandableExtension';

	export let controller: Controller;

	let columns: IField[] = [];
	let metadata: IFieldMetadata<ValueListConfiguration> | null = null;
	let hasDropdowns: boolean = false;
	let table: Table | null = null;

	const component = new InputComponent({
		init() {
			metadata = controller.metadata;

			hasDropdowns = false;

			columns = controller.metadata.Component.Configuration.Fields.map((t) => {
				hasDropdowns ||= ['typeahead', 'multiselect', 'dropdown'].includes(
					t.Metadata.Component.Type
				);

				return t;
			}).sort((a, b) => a.Metadata.OrderIndex - b.Metadata.OrderIndex);
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
	<div class="table-responsive" class:has-dropdowns={hasDropdowns}>
		<table class="table table-borderless table-sm">
			{#if table.colgroups?.length > 0}
				{#each table.colgroups as colgroup}
					<colgroup span={colgroup.span} class={colgroup.cssClass} style={colgroup.style} />
				{/each}
			{/if}
			<thead>
				{#each table.head.above as header}
					<tr class={header.cssClass}>
						{#each header.cells as cell, index}
							<th
								use:tooltip={cell.documentation}
								style={cell.style}
								colspan={cell.colspan}
								class={cell.cssClass}
								on:click={() => cell.click()}
							>
								{#if cell.component != null}
									<svelte:component
										this={cell.component.component}
										controller={cell.component.controller}
									/>
								{:else}
									{cell.label}
								{/if}
							</th>
						{/each}
					</tr>
				{/each}

				<tr>
					{#each table.head.main.cells as cell}
						<th
							use:tooltip={cell.documentation}
							colspan={cell.colspan}
							class={cell.cssClass}
							style={cell.style}
							on:click={() => cell.click()}
						>
							{#if cell.component != null}
								<svelte:component
									this={cell.component.component}
									controller={cell.component.controller}
								/>
							{:else if cell.label?.length > 0}
								{cell.label}
							{:else if cell.documentation != null}
								<div class="text-center">
									<i class="fas fa-question-circle" />
								</div>
							{/if}
						</th>
					{/each}
					{#if metadata.Component.Configuration.CanRemove || metadata.Component.Configuration.CanAdd}
						<th />
					{/if}
				</tr>

				{#each table.head.below as footer}
					<tr class={footer.cssClass}>
						{#each footer.cells as cell, index}
							<th
								use:tooltip={cell.documentation}
								colspan={cell.colspan}
								class={cell.cssClass}
								style={cell.style}
								on:click={() => cell.click()}
							>
								{#if cell.component != null}
									<svelte:component
										this={cell.component.component}
										controller={cell.component.controller}
									/>
								{:else}
									{cell.label}
								{/if}
							</th>
						{/each}
					</tr>
				{/each}
			</thead>
			<tbody>
				{#each table.body.filter((t) => !t.deleted) as rowGroup}
					{#each rowGroup.above as header, index}
						<tr class:group-header={true} class={header.cssClass}>
							{#each header.cells as cell}
								<td colspan={cell.colspan} class={cell.cssClass}>
									<Output controller={cell.controller} nolayout={true} />
								</td>
							{/each}
						</tr>
					{/each}

					<tr class="main">
						{#each rowGroup.main.cells as cell}
							<td colspan={cell.colspan} class={cell.cssClass}>
								{#if !cell.hidden}
									{#if cell.isInput}
										<Input controller={getControllerOrException(rowGroup, cell)} nolayout={true} />
									{:else}
										<Output controller={getControllerOrException(rowGroup, cell)} nolayout={true} />
									{/if}
								{/if}
							</td>
						{/each}
						{#if metadata.Component.Configuration.CanRemove == true}
							<td class="col-action">
								<button
									class="btn btn-outline-light"
									type="button"
									use:tooltip={'Remove row'}
									on:click|preventDefault={() => {
										rowGroup.deleted = true;
										table = table;
									}}
								>
									<i class="fa fa-trash" />
								</button>
							</td>
						{/if}
					</tr>

					{#each rowGroup.below as footer}
						<tr class:footer={true} class={footer.cssClass}>
							{#each footer.cells as cell, index}
								<td colspan={cell.colspan} class={cell.cssClass}>
									<Output controller={cell.controller} nolayout={true} />
								</td>
							{/each}
						</tr>
					{/each}
				{/each}
			</tbody>
			{#if metadata.Component.Configuration.CanAdd}
				<tfoot>
					<tr>
						<td colspan={columns.length - 1} />
						<td class="col-action">
							<button
								class="btn btn-outline-primary"
								type="button"
								use:tooltip={'Add row'}
								on:click|preventDefault={addNewRow}
							>
								<i class="fa fa-circle-plus" />
							</button>
						</td>
					</tr>
				</tfoot>
			{/if}
		</table>
	</div>
{:else}
	<div>No items found.</div>
{/if}

<style lang="scss">
	@import '../scss/styles.variables.scss';

	div.table-responsive {
		--inner-border-color: rgba(0, 0, 0, 0.03);
		--outer-border-color: #ebebeb;
		--group-border-color: #d6d6d645;
		min-width: min-content;

		thead {
			& > tr:last-child {
				border-bottom-width: 3px;
			}

			& > tr > .has-documentation {
				text-decoration: underline;
				text-decoration-style: dashed;
			}

			& > tr.bulk-input-row > th {
				background: $app-soft-bg;
				border-bottom: 0 0 2px 0;
			}
		}

		tbody {
			& > tr > td {
				vertical-align: top;
				padding: 10px 10px;
			}

			& > tr > td:has(input) {
				padding: 4px 8px;
			}

			& > tr > td.min-width-200 {
				min-width: 200px;
			}

			& > tr.main:hover > td {
				background-color: $app-soft-bg;
			}
		}

		.group-header {
			background: var(--group-border-color);

			& > td {
				padding: 15px 20px;
			}
		}

		.column-group {
			text-align: center;
			border-bottom: 0px !important;
			border-left: 3px solid var(--group-border-color);
			border-right: 3px solid var(--group-border-color);
		}

		td.col-min-width {
			width: 1px;
			padding-left: 8px;
			padding-right: 8px;
		}

		td.min-width-200 {
			min-width: 200px;
		}

		td.min-width-400 {
			min-width: 400px;
		}
	}

	.has-dropdowns {
		// Add padding to account for typeahead, dropdown or any other input
		// that can grow vertically.
		padding-bottom: 18rem;
	}

	.col-action {
		width: 1px;
		text-align: center;
	}

	button.btn {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.1em;
		color: #218fcf;
		padding: 5px 15px;
		background: #ffffff;
		border: none;
		cursor: pointer;
	}
</style>
