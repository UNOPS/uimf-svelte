<script context="module" lang="ts">
</script>

<script lang="ts">
	import { OutputController } from '../../../Infrastructure/OutputController';
	import { OutputComponent } from '../../../Infrastructure/Component';
	import { beforeUpdate } from 'svelte';
	import { ActionListColumnExtension } from '../Extensions/ActionListColumnExtension';
	import { BulkAction, BulkActionsColumnExtension } from '../Extensions/BulkActionsColumnExtension';
	import { RowExtension } from '../Extensions/RowExtension';
	import { Table } from '../Table';
	import { ColumnExtension } from '../Extensions/ColumnExtension';
	import { ExpandableExtension } from '../Extensions/ExpandableExtension';
	import FormLink from '../../../Outputs/FormLink.svelte';
	import type {
		Controller as FormLinkController,
		FormLinkData
	} from '../../../Outputs/FormLink.svelte';
	import { tooltip } from '../../../Components/Tooltip.svelte';
	import Output from '../../../Output.svelte';
	import type { TableExtension } from '../TableExtension';
	import type { ComponentMetadata } from '$lib/Infrastructure/uimf';
	import { DocumentationExtension } from '../Extensions/DocumentationExtension';
	import type { IField } from '../IColumn';

	export let controller: OutputController<any>;
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

			table = new Table({
				parent: controller,
				extensions: extensions,
				columns: (controller.metadata.CustomProperties?.Columns ?? []).map(
					(t: ComponentMetadata) => {
						return {
							Metadata: t,
							IsInput: false
						} as IField;
					}
				)
			});

			await table.setData(
				controller.value?.length != null ? controller.value : controller.value?.Results ?? []
			);

			extraColspan = bulkActionExtension.actions.length > 0 ? 1 : 0;
			type = controller.metadata.Type;

			inputFieldValues = await controller.form?.getInputFieldValues();

			table.on('table:data:updated', (e) => {
				table = table;
			});
		}
	});

	beforeUpdate(async () => {
		if (controller?.metadata?.Type == type || type == null) {
			await component.setup(controller);
		}
	});

	const makeFormLinkController = (formlink: FormLinkData | BulkAction) => {
		return new OutputController<FormLinkData>({
			metadata: {} as ComponentMetadata,
			data: formlink,
			form: controller.form,
			app: controller.app
		}) as FormLinkController;
	};
</script>

{#if table?.body == null || table.body.length === 0}
	<em>{controller?.metadata?.CustomProperties?.tableConfig?.NoDataLabel ?? 'No data found.'}</em>
{:else}
	<div class={(controller?.metadata?.CustomProperties?.CssClass ?? '') + ' table-responsive'}>
		{#if bulkActionExtension.actions.length > 0 || controller.metadata.CustomProperties?.showExportButton}
			<div class="btn-bar">
				{#each bulkActionExtension.actions as action}
					<FormLink controller={makeFormLinkController(action)} disabled={action.disabled} />
				{/each}

				{#if controller.metadata.CustomProperties?.showExportButton && controller.form != null}
					<FormLink
						controller={makeFormLinkController({
							Label: '',
							Action: 'excel-export',
							InputFieldValues: inputFieldValues,
							Form: controller.form.metadata.Id,
							Field: controller.metadata.Id,
							Icon: 'fas fa-download'
						})}
					/>
				{/if}
			</div>
		{/if}

		<table class="table table-bordered">
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
					<tr class={header.cssClass}>
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
				<tr>
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
							{/if}</th
						>
					{/each}
				</tr>
				{#each table.head.below as footer}
					<tr class={footer.cssClass}>
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
			<tbody>
				{#each table.body as rowGroup}
					{#each rowGroup.above as header, index}
						<tr class:group-header={true} class={header.cssClass}>
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
							<td colspan={cell.colspan} class={cell.cssClass}>
								<Output controller={cell.controller} hideLabel={true} />
							</td>
						{/each}
					</tr>

					{#each rowGroup.below as footer}
						{#if footer.append}
							<tr class:d-none={!footer.visible} class:fotter={true} class={footer.cssClass}>
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
			text-align: right;
			padding: 5px 2px;
			border-bottom: 1px solid var(--inner-border-color);
			background-color: shade-color($app-soft-bg, 1%);

			& > :global(button) {
				margin-right: 5px;
			}
		}

		.group-header {
			background: $app-soft-bg;

			& > td {
				padding: 10px 20px;
			}
		}

		thead {
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
		}

		tbody > tr:hover {
			background-color: var(--bs-tertiary-bg);
		}

		tbody > tr.footer:hover,
		tbody > tr.footer {
			& > td {
				--border: 1px solid var(--inner-border-color);
				border-top: var(--border);
				border-bottom: var(--border);
				padding: 10px 15px;
			}
		}

		td.col-min-width {
			width: 1px;
			padding-left: 8px;
			padding-right: 8px;
		}
	}

	:global(.table > tbody > tr.footer > td .outputs) {
		margin: 0;
	}
</style>
