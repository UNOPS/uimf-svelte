<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import Output from '../Output.svelte';
	import { TableBuilder } from './Table/TableBuilder';

	// import { ColumnGroupsExtension } from './Table/Extensions/ColumnGroupsExtension';
	// import { ExpandableExtension } from './Table/Extensions/ExpandableExtension';
	// import { ActionListColumnExtension } from './Table/Extensions/ActionListColumnExtension';
	// import { BulkActionsColumnExtension } from './Table/Extensions/BulkActionsColumnExtension';
	// import { RowGroupExtension } from './Table/Extensions/RowGroupExtension';

	import { tooltip } from '../Components/Tooltip.svelte';
	import type { Table } from './Table/Table';

	export let controller: OutputController<any>;

	// Field variables.
	let allRowsSelected: boolean = false;
	let table: Table;
	//let bulkActionExtension: BulkActionsColumnExtension = new BulkActionsColumnExtension();
	let extraColspan: number = 0;

	//export let withLabel = true;

	let component = new OutputComponentController({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	let bulkActionExtension = { actions: [] };
	bulkActionExtension.actions = [];

	const extensions: any[] = [
		//		new ColumnGroupsExtension(),
		//		new RowGroupExtension(),
		//		new ActionListColumnExtension(),
		//		new ExpandableExtension(),
		//		bulkActionExtension
	];
	const builder = new TableBuilder(extensions);

	const rows = controller.value.length > 0 ? controller.value : controller.value.Items;
	table = builder.build(controller, rows, controller.metadata.CustomProperties?.Columns);
</script>

{#if table?.body == null || table.body.length === 0}
	<em>{controller?.metadata?.CustomProperties?.tableConfig?.NoDataLabel ?? 'No data found.'}</em>
{:else}
	{#if bulkActionExtension.actions.length > 0 || controller.metadata.CustomProperties?.ExcelExport}
		<div class="btn-bar">
			{#each bulkActionExtension.actions as action}
				<!-- <FormLink
					field={new OutputController(null, action, controller.form, controller.app)}
					disabled={action.disabled}
				/>  -->
			{/each}

			{#if controller.metadata.CustomProperties?.ExcelExport}
				<button
					class="btn btn-sm btn-default"
					use:tooltip={'Export to excel'}
					on:click={async () => {
						var params = await controller.value.form.getInputFields();
						var query = encodeURIComponent(JSON.stringify(params));
						await window.open(
							`/api/form/excel/${controller.value.form.metadata.Id}/${controller.metadata.Id}?${query}`
						);
					}}><i class="fas fa-download" /></button
				>
			{/if}
		</div>
	{/if}

	<div class={(controller?.metadata?.CustomProperties?.CssClass ?? '') + ' table-responsive'}>
		<table class="table table-striped">
			{#if table.colgroups?.length > 0}
				{#if bulkActionExtension.actions.length > 0}
					<colgroup />
				{/if}
				{#each table.colgroups as colgroup}
					<colgroup span={colgroup.span} class={colgroup.cssClass} style={colgroup.style} />
				{/each}
			{/if}
			<thead>
				{#each table.head.above as header}
					<tr>
						{#each header.cells as cell, index}
							<th
								use:tooltip={cell.documentation}
								style={cell.style}
								colspan={cell.colspan + (index === 0 ? extraColspan : 0)}
								class={cell.cssClass}>{cell.label}</th
							>
						{/each}
					</tr>
				{/each}
				<tr>
					{#if bulkActionExtension.actions.length > 0}
						<th class="min-width">
							<input
								type="checkbox"
								bind:checked={allRowsSelected}
								on:change={(e) => {
									//bulkActionExtension.selectAllRows(allRowsSelected);
									table.body = table.body;
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
						>
							{#if cell.label?.length > 0}{cell.label}
							{:else if cell.documentation != null}<div class="text-center">
									<i class="fas fa-question-circle" />
								</div>
							{/if}</th
						>
					{/each}
				</tr>
				{#each table.head.below as footer}
					<tr>
						{#each footer.cells as cell, index}
							<th
								use:tooltip={cell.documentation}
								colspan={cell.colspan + (index === 0 ? extraColspan : 0)}
								class={cell.cssClass}
								style={cell.style}>{cell.label}</th
							>
						{/each}
					</tr>
				{/each}
			</thead>
			<tbody>
				{#each table.body as rowGroup}
					{#each rowGroup.above as header, index}
						<tr class="group-header">
							{#each header.cells as cell}
								<td colspan={cell.colspan + (index === 0 ? extraColspan : 0)} class={cell.cssClass}>
									<Output controller={cell.controller} hideLabel={true} />
								</td>
							{/each}
						</tr>
					{/each}

					<tr>
						{#if bulkActionExtension.actions.length > 0}
							<td>
								<input
									type="checkbox"
									bind:checked={rowGroup.selected}
									on:change={() => {
										//	bulkActionExtension.refresh();
										table.body = table.body;
										bulkActionExtension.actions = bulkActionExtension.actions;
									}}
								/>
							</td>
						{/if}
						{#each rowGroup.main.cells as cell}
							<td colspan={cell.colspan} class={cell.cssClass}>
								<Output controller={cell.controller} hideLabel={true} />
							</td>
						{/each}
					</tr>

					{#each rowGroup.below as footer}
						{#if footer.append}
							<tr class:d-none={!footer.visible} class="footer">
								{#each footer.cells as cell, index}
									<td
										colspan={cell.colspan + (index === 0 ? extraColspan : 0)}
										class={cell.cssClass}
									>
										<Output controller={cell.controller} hideLabel={true} />
									</td>
								{/each}
							</tr>
						{/if}
					{/each}
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style lang="scss">
	.min-width {
		width: 1px;
	}

	.btn-bar {
		text-align: right;
		padding: 5px 2px;
		border-radius: 5px 5px 0px 0px;
		border: 1px solid var(--app-border-color);
		background-color: var(--app-body-bg);
		border-bottom: 0;
	}

	.btn-bar > :global(button) {
		margin-right: 5px;
	}

	.group-header {
		background: var(--app-secondary-bg);

		& > td {
			padding: 10px 20px;
		}
	}

	thead > tr:last-child {
		border-bottom-width: 3px;
	}

	.column-group {
		text-align: center;
		border-bottom: 0px !important;
		border-left: 3px solid var(--app-border-color);
		border-right: 3px solid var(--app-border-color);
	}

	.table {
		margin-bottom: 0;
		width: 90% !important;
	}

	.table > thead > tr:first-child > th {
		background-color: var(--app-primary-bg-subtle);
		color: var(--app-primary-text-emphasis);
	}

	.table > thead > tr:nth-child(2) > th {
		background-color: var(--app-info-bg-subtle);
		color: var(--app-info-text-emphasis);
	}

	.table > :not(:first-child) {
		/* Override Bootstrap weirdness, which renders thick border for a colgroup. */
		border-top: inherit;
	}

	.table > tbody > tr:hover {
		background-color: var(--app-tertiary-bg);
	}

	.table > tbody > tr.footer:hover,
	.table > tbody > tr.footer {
		background: var(--app-tertiary-bg);

		& > td {
			--border: 5px solid var(--app-primary-bg-subtle);
			border-top: var(--border);
			border-bottom: var(--border);
		}
	}

	:global(.table > tbody > tr.footer > td .outputs) {
		margin: 0;
	}

	div:global(.boxed) {
		--border-color: var(--app-border-color);

		height: 400px;
		overflow: auto;
		border: 1px solid var(--border-color);
		border-width: 1px 3px 1px 1px;

		table {
			overflow: auto;
			height: 100px;
		}

		table thead th {
			position: sticky;
			top: 0;
			z-index: 1;
			background: var(--app-dark);
		}

		table,
		table td {
			box-shadow: inset 1px -1px var(--border-color);
			border: none !important;
		}

		table th {
			box-shadow: inset 1px 1px var(--border-color), 1px 2px var(--border-color);
			border: none !important;
		}

		.table-bordered > :not(caption) > * {
			border-width: 0;
		}
	}
</style>
