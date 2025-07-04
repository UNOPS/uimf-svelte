<script context="module" lang="ts">
	import { InputController, type CreateInputOptions } from '../../Infrastructure/InputController';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import type { IFieldMetadata, IInputFieldMetadata } from '../../Infrastructure/uimf';

	export class Controller extends InputController<
		ITableInputData,
		IInputFieldMetadata<ITableInputConfiguration>
	> {
		public table: Table;

		constructor(options: CreateInputOptions<IInputFieldMetadata<ITableInputConfiguration>>) {
			super(options);

			this.table = this.createTable();
		}

		public deserialize(value: string): Promise<ITableInputData> {
			var result = JSON.parse(value);
			return Promise.resolve(result);
		}

		public serialize(value: ITableInputData): string | null {
			return value != null && value.Items?.length > 0 ? JSON.stringify(value) : null;
		}

		public async getValue(): Promise<ITableInputData> {
			const promises = [];
			const rowDatas: ITableInputItem[] = [];

			for (const row of this.table.body) {
				if (row.deleted) {
					continue;
				}

				const rowData: ITableInputItem = { CanRemove: row.data.CanRemove };
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

			return Promise.resolve({ Items: rowDatas });
		}

		protected async setValueInternal(value: ITableInputData | null): Promise<void> {
			// Make sure that `field.value.Items` has a non-null value.
			// This is important to ensure that the newly-added items
			// can be retrieved (and POSTed).
			this.value = {
				Items: value?.Items ?? []
			};

			this.table = this.createTable();

			const items = this.value.Items.map((item) => {
				return { ...item };
			});

			await this.table.setData(items);
		}

		private createTable(): Table {
			if (this.metadata.Component.Configuration.Row != null) {
				// TableInput stores row metadata in component configuration,
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
					new TableInputExtension()
				],
				inputOnChange: async (row, cell) => {
					// When the cell value changes, the overall `table-input` should also be updated.
					await cell.getValue().then((value) => {
						this.value!.Items[row.index][cell.metadata.Id] = value;
					});
				}
			});
		}
	}

	export interface ITableInputData {
		Items: ITableInputItem[];
	}

	interface ITableInputItem {
		CanRemove: boolean;
		[key: string]: any;
	}

	export interface Row {
		index: number;
		_controllers: Record<string, InputController<any> | OutputController<any>>;
		_deleted: boolean | null;
	}

	export interface ITableInputConfiguration {
		AddRowLabel?: string;
		RemoveRowLabel?: string;
		Fields: IField[];
		CanAdd?: boolean;

		/**
		 * The name of the field inside response that contains the default row value.
		 * If null the newly created rows will be initialized without any of its
		 * fields pre-set.
		 */
		DefaultRowValue?: string;

		Row: { GroupBy?: string };
	}
</script>

<script lang="ts">
	import { InputComponent } from '../../Infrastructure/Component';
	import { beforeUpdate, tick } from 'svelte';
	import Input from '../../Input.svelte';
	import { tooltip } from '../../Components/Tooltip.svelte';
	import Output from '../../Output.svelte';
	import { Table, TableBodyCell, TableRowGroup } from '../../Outputs/Table';
	import { DocumentationExtension } from '../../Outputs/Table/Extensions/DocumentationExtension';
	import { ColumnExtension } from '../../Outputs/Table/Extensions/ColumnExtension';
	import { RowExtension } from '../../Outputs/Table/Extensions/RowExtension';
	import { ActionListColumnExtension } from '../../Outputs/Table/Extensions/ActionListColumnExtension';
	import type { IField } from '../../Outputs/Table/IColumn';
	import { TableInputExtension as TableInputExtension } from '../../Outputs/Table/Extensions/TableInputExtension';
	import { ExpandableExtension } from '../../Outputs/Table/Extensions/ExpandableExtension';

	export let controller: Controller;

	let metadata: IFieldMetadata<ITableInputConfiguration> | null = null;
	let table: Table | null = null;
	let extraColSpan: number = 1;

	const component = new InputComponent({
		init() {
			metadata = controller.metadata;
		},
		async refresh() {
			table = controller.table;

			table.on('input:change', function () {
				table = table;
			});
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	async function addNewRow(e: Event): Promise<void> {
		if (table == null) {
			throw 'Cannot add row to a `null` table.';
		}

		let defaultRowValue = {
			// Newly added rows can always be removed.
			CanRemove: true
		};

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

	function asOutputController(
		controller: InputController<any> | OutputController<any>
	): OutputController<any> {
		return controller as OutputController<any>;
	}
</script>

{#if metadata != null && table != null && (table.body.length > 0 || metadata.Component.Configuration.CanAdd)}
	<div class="table-responsive">
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
								colspan={cell.colspan + (header.cells.length === index + 1 ? extraColSpan : 0)}
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

					<th />
				</tr>

				{#each table.head.below as footer}
					<tr class={footer.cssClass}>
						{#each footer.cells as cell, index}
							<th
								use:tooltip={cell.documentation}
								colspan={cell.colspan + (footer.cells.length === index + 1 ? extraColSpan : 0)}
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
					{#each rowGroup.above as header}
						<tr class:group-header={true} class={header.cssClass}>
							{#each header.cells as cell, index}
								<td
									colspan={cell.colspan + (header.cells.length === index + 1 ? extraColSpan : 0)}
									class={cell.cssClass}
								>
									<Output controller={asOutputController(cell.controller)} nolayout={true} />
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

						<td class="col-action">
							{#if rowGroup.data.CanRemove}
								<button
									class="btn btn-link"
									type="button"
									use:tooltip={metadata.Component.Configuration.RemoveRowLabel ?? 'Remove row'}
									on:click|preventDefault={() => {
										rowGroup.deleted = true;
										table = table;
									}}
								>
									<i class="fa fa-trash text-primary" />
								</button>
							{/if}
						</td>
					</tr>

					{#each rowGroup.below as footer}
						<tr class:footer={true} class={footer.cssClass}>
							{#each footer.cells as cell, index}
								<td
									colspan={cell.colspan + (footer.cells.length === index + 1 ? extraColSpan : 0)}
									class={cell.cssClass}
								>
									<Output controller={asOutputController(cell.controller)} nolayout={true} />
								</td>
							{/each}
						</tr>
					{/each}
				{/each}
			</tbody>
			{#if metadata.Component.Configuration.CanAdd}
				<tfoot>
					<tr>
						<td colspan={table.head.main.cells.length} />
						<td class="col-action">
							<button
								class="btn btn-link"
								type="button"
								use:tooltip={metadata.Component.Configuration.AddRowLabel ?? 'Add row'}
								on:click|preventDefault={addNewRow}
							>
								<i class="fa fa-circle-plus text-primary" />
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
	@import '../../scss/styles.variables.scss';

	div.table-responsive {
		--inner-border-color: rgba(0, 0, 0, 0.03);
		--outer-border-color: #ebebeb;
		--group-border-color: #d6d6d645;
		--list-item-border-color: #269dce;

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

			& > tr > td:has(input, select) {
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

	.col-action {
		width: 1px;
		text-align: center;
		vertical-align: middle;
		white-space: nowrap;

		& > button {
			padding: 10px 10px 5px;
			background: transparent;
		}
	}

	i.fa.fa-circle-plus {
		font-size: 18px;
	}

	i.fa.fa-trash {
		font-size: 18px;
	}
</style>
