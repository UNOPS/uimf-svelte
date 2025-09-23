<script context="module" lang="ts">
	export interface TableConfiguration {
		CssClass: string | null;
		NoDataLabel?: string;
		CanExport: boolean;
		Columns: IFieldMetadata[];
		Paginator: string;
		BulkActions: string | null;
		NoHeader: boolean;
		Footer: FooterColumnMetadata[];
	}

	export interface TableMetadata<T = TableConfiguration> extends IOutputFieldMetadata<T> {
		CustomProperties: {
			CssClass: string;
			tableConfig: any;
			row: any;
			Customizations: {
				Paginator: string;
			};
		};
	}
</script>

<script lang="ts">
	import { OutputController } from '../../../Infrastructure/OutputController';
	import { OutputComponent } from '../../../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';
	import { ActionListColumnExtension } from '../Extensions/ActionListColumnExtension';
	import { BulkActionsColumnExtension } from '../Extensions/BulkActionsColumnExtension';
	import { RowExtension } from '../Extensions/RowExtension';
	import { FooterColumnMetadata, Table } from '../Table';
	import { ColumnExtension } from '../Extensions/ColumnExtension';
	import { ExpandableExtension } from '../Extensions/ExpandableExtension';
	import FormLink from '../../../Outputs/FormLink/FormLink.svelte';
	import { tooltip } from '../../../Components/Tooltip.svelte';
	import Output from '../../../Output.svelte';
	import type { TableExtension } from '../TableExtension';
	import type { IFieldMetadata, IOutputFieldMetadata } from '../../../Infrastructure/Metadata';
	import { DocumentationExtension } from '../Extensions/DocumentationExtension';
	import type { IField } from '../IColumn';
	import type { InputController } from '../../../Infrastructure/InputController';
	import type { IPaginatedData } from '../../PaginatedTable/PaginatedTable.svelte';
	import type { TableData } from '../../../Outputs/Table/Table.svelte';
	import { FormlinkUtilities } from '../../../Outputs/FormLink/FormlinkUtilities';
	import type { Field } from '$lib/Infrastructure/Fields/Field';

	export let controller: OutputController<IPaginatedData | TableData, TableMetadata>;
	export let type: string;

	let allRowsSelected: boolean = false;
	let table: Table | null = null;
	let bulkActionExtension: BulkActionsColumnExtension = new BulkActionsColumnExtension();
	let extraColspan: number = 0;
	let inputFieldValues: { [key: string]: any } | undefined;

	const component = new OutputComponent({
		async refresh() {
			allRowsSelected = false;

			const extensions: TableExtension[] = [
				new DocumentationExtension(),
				new ColumnExtension(),
				new RowExtension(),
				new ActionListColumnExtension(),
				new ExpandableExtension(),
				bulkActionExtension
			];

			// Build the table inside a temporary variable first, so that we can replace
			// the table in one go without causing any flickering in the browser.
			const tempTable = new Table({
				parent: controller,
				extensions: extensions,
				footer: controller.metadata.Component.Configuration!.Footer,
				columns: (controller.metadata.Component.Configuration!.Columns ?? []).map(
					(t: IFieldMetadata) => {
						return {
							Metadata: t,
							IsInput: false
						} as IField;
					}
				)
			});

			await tempTable.setData(controller.value?.Results ?? []);

			table = tempTable;

			extraColspan = bulkActionExtension.actions.length > 0 ? 1 : 0;
			type = controller.metadata.Component.Type;

			inputFieldValues = await controller.form?.getInputFieldValues();

			table.on('table:data:updated', (e) => {
				table = table;
			});
		}
	});

	beforeUpdate(async () => {
		if (controller?.metadata?.Component.Type == type || type == null) {
			await component.setup(controller);
		}
	});

	function getExportField(): string | null {
		let path: string | null = null;

		let me: Field | null = controller;

		while (me != null && me.metadata.Id !== '_layout_') {
			path = me.metadata.Id + (path != null ? '.' + path : '');
			me = me.parent;
		}

		return path;
	}

	function getAsOutput(ctrl: OutputController<any> | InputController<any>): OutputController<any> {
		return ctrl as OutputController<any>;
	}

	function getFooterCellController(
		footer: any,
		field: IOutputFieldMetadata
	): OutputController<any, IOutputFieldMetadata<any>> {
		return new OutputController<any>({
			app: controller.app,
			data: footer[field.Id],
			form: controller.form,
			metadata: field,
			parent: controller
		});
	}
</script>

{#if table != null}
	{@const bulkActions = bulkActionExtension.actions ?? []}
	{@const regularActions = controller.value?.Actions ?? []}
	{@const canExport = controller.metadata.Component.Configuration?.CanExport ?? false}

	<div class="table-responsive">
		{#if bulkActions.length > 0 || regularActions.length > 0 || canExport}
			<div class="btn-bar">
				{#if bulkActions.length > 0}
					<div class="bulk-actions">
						{#each bulkActions as action}
							<FormLink
								controller={FormlinkUtilities.createFormlink({ data: action, parent: controller })}
								disabled={action.disabled}
							/>
						{/each}
					</div>
				{/if}

				{#if regularActions.length > 0 || canExport}
					<div class="regular-actions">
						{#each regularActions as action}
							<FormLink
								controller={FormlinkUtilities.createFormlink({ data: action, parent: controller })}
							/>
						{/each}

						{#if canExport && controller.form != null}
							<FormLink
								controller={FormlinkUtilities.createFormlink({
									data: {
										Label: '',
										Action: 'excel-export',
										InputFieldValues: inputFieldValues,
										Form: controller.form.metadata.Id,
										Field: getExportField(),
										Icon: 'fas fa-download'
									},
									parent: controller
								})}
							/>
						{/if}
					</div>
				{/if}
			</div>
		{/if}

		<table
			class={controller.metadata.Component.Configuration.CssClass ??
				'table table-bordered table-group-divider'}
		>
			{#if table.colgroups?.length > 0}
				{#if bulkActionExtension.actions.length > 0}
					<colgroup />
				{/if}
				{#each table.colgroups as colgroup}
					<colgroup span={colgroup.span} class={colgroup.cssClass} style={colgroup.style} />
				{/each}
			{/if}
			{#if controller.metadata.Component.Configuration.NoHeader !== true}
				<thead>
					{#each table.head.above as header}
						<tr class={header.cssClass} style={header.style}>
							{#each header.cells as cell, index}
								<th
									use:tooltip={cell.documentation}
									style={cell.style}
									colspan={cell.colspan + (index === 0 ? extraColspan : 0)}
									class={cell.cssClass}
									on:click={() => cell.click()}>{cell.label}</th
								>
							{/each}
						</tr>
					{/each}
					<tr class={table.head.main.cssClass} style={table.head.main.style}>
						{#if bulkActionExtension.actions.length > 0}
							<th class="min-width">
								<input
									type="checkbox"
									bind:checked={allRowsSelected}
									on:change={(e) => {
										bulkActionExtension.selectAllRows(allRowsSelected);
										if (table != null) {
											table.body = table.body;
										}
										bulkActionExtension.actions = bulkActionExtension.actions;
									}}
								/>
							</th>
						{/if}
						{#each table.head.main.cells as cell}
							<th
								use:tooltip={cell.documentation}
								colspan={cell.colspan}
								class={cell.cssClass}
								style={cell.style}
								on:click={() => cell.click()}
							>
								{#if cell.label?.length > 0}
									{cell.label}
								{:else if cell.documentation != null}
									<div class="text-center">
										<i class="fas fa-question-circle" />
									</div>
								{/if}

								{#if cell.ascending === true}
									<i class="fa-solid fa-sort-down" />
								{:else if cell.ascending === false}
									<i class="fa-solid fa-sort-up" />
								{:else if cell.cssClassManager.cssClassObject['sortable'] === true}
									<i class="fa-solid fa-sort" />
								{/if}
							</th>
						{/each}
					</tr>
					{#each table.head.below as footer}
						<tr class={footer.cssClass} style={footer.style}>
							{#each footer.cells as cell, index}
								<th
									use:tooltip={cell.documentation}
									colspan={cell.colspan + (index === 0 ? extraColspan : 0)}
									class={cell.cssClass}
									style={cell.style}
									on:click={() => cell.click()}>{cell.label}</th
								>
							{/each}
						</tr>
					{/each}
				</thead>
			{/if}
			<tbody>
				{#if table.body == null || table.body.length === 0}
					<tr>
						<td colspan={table.head.main.cells.length + extraColspan}>
							<em>
								{controller.metadata.Component.Configuration?.NoDataLabel ?? 'No data found.'}
							</em>
						</td>
					</tr>
				{:else}
					{#each table.body as rowGroup}
						{#each rowGroup.above as header, index}
							<tr class:group-header={true} class={header.cssClass} style={header.style}>
								{#each header.cells as cell}
									<td
										colspan={cell.colspan + (index === 0 ? extraColspan : 0)}
										class={cell.cssClass}
									>
										<Output controller={getAsOutput(cell.controller)} nolayout={true} />
									</td>
								{/each}
							</tr>
						{/each}

						<tr class={rowGroup.main.cssClass} style={rowGroup.main.style}>
							{#if bulkActionExtension.actions.length > 0}
								<td>
									<input
										type="checkbox"
										bind:checked={rowGroup.selected}
										on:change={() => {
											bulkActionExtension.refresh();
											if (table != null) {
												table.body = table.body;
											}
											bulkActionExtension.actions = bulkActionExtension.actions;
										}}
									/>
								</td>
							{/if}
							{#each rowGroup.main.cells as cell}
								<td colspan={cell.colspan} class={cell.cssClass} bind:this={cell.element}>
									<Output controller={getAsOutput(cell.controller)} nolayout={true} />
								</td>
							{/each}
						</tr>

						{#each rowGroup.below as footer}
							{#if footer.append}
								<tr
									class:d-none={!footer.visible}
									class:footer={true}
									class={footer.cssClass}
									style={footer.style}
								>
									{#each footer.cells as cell, index}
										<td
											colspan={cell.colspan + (index === 0 ? extraColspan : 0)}
											class={cell.cssClass}
										>
											<Output controller={getAsOutput(cell.controller)} nolayout={true} />
										</td>
									{/each}
								</tr>
							{/if}
						{/each}
					{/each}
				{/if}
			</tbody>
			{#if controller.value?.Footer?.length > 0}
				<tfoot>
					{#each controller.value.Footer as row}
						<tr class={row.CssClass}>
							{#each table.footerColumns as cell}
								<td
									colspan={cell.colspan}
									class={cell.metadata?.CustomProperties.FooterColumn.CssClass}
								>
									{#if cell.metadata != null}
										<Output
											controller={getFooterCellController(row, cell.metadata)}
											nolayout={true}
										/>
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tfoot>
			{/if}
		</table>
	</div>
{/if}

<style lang="scss">
	@import '../../../scss/styles.variables.scss';

	.min-width {
		width: 1px;
	}

	.d-none {
		display: none;
	}

	input[type='checkbox'] {
		margin: 0;
	}

	div.table-responsive {
		--inner-border-color: rgba(0, 0, 0, 0.03);
		--outer-border-color: #ebebeb;
		--group-border-color: #d6d6d645;

		border: 1px solid var(--outer-border-color);
		border-radius: 4px 4px 0px 4px;

		& > .btn-bar {
			display: flex;
			padding: 5px;
			border-bottom: 1px solid var(--inner-border-color);
			background-color: shade-color($app-soft-bg, 1%);

			& > .regular-actions {
				flex-grow: 1;
				text-align: right;
				background-color: $app-soft-bg;
				padding-left: 15px;
			}

			& > .bulk-actions {
				flex-grow: 1;
				text-align: left;
				background-color: $app-soft-bg;
			}

			& > div > :global(button) {
				margin: 2px 3px;
			}
		}

		.group-header {
			background: $app-soft-bg;

			& > td {
				padding: 10px 20px;
			}
		}

		thead {
			background: var(--uimf-btn-bg);

			& > tr:last-child {
				border-bottom-width: 3px;
			}

			& > tr > .has-documentation {
				text-decoration: underline;
				text-decoration-style: dashed;
			}
		}

		.column-group {
			text-align: center;
			border-bottom: 0px !important;
			border-left: 3px solid var(--group-border-color);
			border-right: 3px solid var(--group-border-color);
		}

		.table {
			margin-bottom: 0;
			border: none;

			& > :not(:first-child) {
				/* Override Bootstrap weirdness, which renders thick border for a colgroup. */
				border-top: inherit;
			}
		}

		tbody > tr > td,
		thead > tr > th {
			border-color: var(--inner-border-color);
			line-height: initial;
		}

		tbody > tr {
			&.selected > td {
				border-bottom: 2px solid #d6ddfd;
				border-top: 2px solid #d6ddfd;
				background: aliceblue;
			}
		}

		tbody > tr:hover {
			background-color: var(--bs-tertiary-bg);
		}

		tbody > tr.footer:hover,
		tbody > tr.footer {
			& > td {
				--border: 2px solid rgb(200 204 206 / 60%);
				border-top: var(--border);
				border-bottom: var(--border);
				padding: 10px 15px;
				background: aliceblue;
				color: var(--bs-body-color);
			}
		}

		tbody > tr.first-row-in-split-by-group {
			&.default > td {
				border-top-width: 10px !important;
				border-top-color: #ebebeb !important;
			}

			&.thin > td {
				border-top-width: 2px !important;
				border-top-color: #efefef !important;
			}
		}

		td.col-min-width {
			width: 1px;
			padding-left: 8px;
			padding-right: 8px;
		}

		td.min-width-200 {
			min-width: 200px;
		}

		th.sortable {
			cursor: pointer;

			& > i {
				position: relative;
				margin: 0 0 0 5px;

				&.fa-sort-up {
					top: 4px;
				}

				&.fa-sort-down {
					top: -2px;
				}

				&.fa-sort {
					opacity: 0.2;
				}
			}
		}

		tfoot > tr {
			&:first-child > td {
				border-top: 3px solid var(--outer-border-color);
				padding-top: 15px;
			}

			&:last-child > td {
				padding-bottom: 15px;
			}

			& > td {
				background-color: #f9f9f9;
				border-width: 0;
			}
		}

		&:has(.table-borderless) {
			border: none;
		}

		.table-borderless {
			border: none;
			background: none;

			& > thead > tr > th {
				border: none;
			}

			& > tbody > tr > td {
				border: none;
			}
		}

		.table-sm {
			& > thead > tr > th {
				padding: 5px;
			}

			& > tbody > tr > td {
				padding: 5px;
			}
		}
	}

	:global(.table > tbody > tr.footer > td .outputs) {
		margin: 0;
	}
</style>
