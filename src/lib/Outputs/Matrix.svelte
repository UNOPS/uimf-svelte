<script context="module" lang="ts">
	import { OutputControlConfiguration } from '../../ts/framework';
	export const config = new OutputControlConfiguration('block', true, 'matrix');

	class RowMetadata {
		public Metadata: IOutputFieldMetadata<
			IMatrixConfiguration,
			{
				MatrixData?: { IsSummary: boolean };
				Documentation?: string;
			} | null
		>;

		public Path: string;
		public OrderIndex: number;
		public Level: number;
	}

	export interface IMatrixConfiguration {
		Properties: IOutputFieldMetadata[];
	}

	export interface IMatrix {
		Items: any[];
	}
</script>

<script lang="ts">
	import { OutputController } from '../../ts/framework';
	import { SvelteOutputController } from '$lib/uimf/ts/framework/SvelteControllers';
	import { beforeUpdate } from 'svelte';
	import type { IOutputFieldMetadata } from '$lib/uimf/ts/server';
	import Output from '../Output.svelte';
	import { tooltip } from '../actions/Tooltip.svelte';

	export let field: OutputController<IMatrix, IMatrixConfiguration | null>;
	let columns: OutputController[] = [];
	let rows: RowMetadata[] = [];

	function getRows(
		properties: IOutputFieldMetadata<IMatrixConfiguration>[],
		level: number = null
	): RowMetadata[] {
		var result: RowMetadata[] = [];
		level = level || 1;

		let orderIndex: number = 0;
		let propertiesSorted = properties.sort((a, b) => a.OrderIndex - b.OrderIndex);

		for (let property of propertiesSorted) {
			if (property.Component.Type === 'matrix-data') {
				result.push({
					Metadata: property,
					Path: null,
					OrderIndex: orderIndex++,
					Level: level
				});

				var subrows = getRows(property.Component.Configuration.Properties, level + 1);
				for (var subrow of subrows) {
					result.push({
						OrderIndex: orderIndex++,
						Path:
							subrow.Path != null ? property.Id + '.Value.' + subrow.Path : property.Id + '.Value',
						Metadata: subrow.Metadata,
						Level: subrow.Level
					});
				}
			} else {
				result.push({
					OrderIndex: orderIndex++,
					Path: property.Id,
					Metadata: property,
					Level: level
				});
			}
		}

		return result.sort((a, b) => a.OrderIndex - b.OrderIndex);
	}

	function getPropertyValue(object, propertyPath) {
		return propertyPath.split('.').reduce(function (a, b) {
			return a && a[b];
		}, object);
	}

	const controller = SvelteOutputController.for(field, {
		refreshBrowser() {
			field.data = field.data;

			rows = getRows(field.metadata.Component.Configuration.Properties);

			if (field?.data?.Items != null) {
				columns = [];

				for (let item of field.data.Items) {
					var column: any = {};

					for (let row of rows) {
						if (row.Path == null) {
							continue;
						}

						if (row.Path.includes('.')) {
							column[row.Path] = new OutputController({
								metadata: row.Metadata,
								data: getPropertyValue(item, row.Path),
								form: field.form,
								app: field.app,
								parent: field
							});
						} else {
							column[row.Path] = new OutputController({
								metadata: row.Metadata,
								data: item[row.Metadata.Id],
								form: field.form,
								app: field.app,
								parent: field
							});
						}
					}

					columns.push(column);
				}
			} else {
				columns = [];
				rows = [];
			}

			return Promise.resolve();
		}
	}).start(field);

	beforeUpdate(async () => {
		await controller.setupBrowser(field);
	});
</script>

{#if columns?.length > 0 && rows?.length > 0}
	<div class="table-responsive">
		<table class="table table-striped table-bordered">
			<tbody>
				{#each rows as row, index}
					<tr class:summary={row.Metadata.CustomProperties?.MatrixData?.IsSummary}>
						{#if row.Metadata.Component.Type !== 'matrix-data'}
							<td
								use:tooltip={row.Metadata.Documentation}
								class="first-column"
								style:padding-left={Math.max(
									20,
									(row.Level - 1) * 20 +
										(row.Metadata.CustomProperties?.MatrixData?.IsSummary ? -20 : 0)
								) + 'px'}>{row.Metadata.Label}</td
							>
							{#each columns as column}
								<td class:first-row={index === 0}>
									<Output field={column[row.Path]} nolayout={true} />
								</td>
							{/each}
						{:else}
							<td
								class="group-row"
								class:second-level={row.Level > 1}
								class:deep-level={row.Level > 2}
								colspan={columns.length + 1}
								style:padding-left={Math.max(20, (row.Level - 1) * 20) + 'px'}
								>{row.Metadata.Label}</td
							>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style lang="scss">
	.first-column {
		width: 100px;
		white-space: nowrap;
		background-color: var(--app-primary-bg-subtle);
		color: var(--app-primary-text-emphasis);
		padding-left: 40px;
	}

	.first-row {
		background-color: var(--app-primary-bg-subtle);
		color: var(--app-primary-text-emphasis);
	}

	.table > tbody > tr:hover {
		background-color: var(--app-tertiary-bg);
	}

	.group-row {
		color: var(--app-info-bg-subtle);
		background: var(--app-info-text-emphasis);

		padding: 10px 20px;
		font-size: 1.2em;
	}

	.second-level {
		font-size: 1em;
		padding: 6px 20px;
		color: var(--app-info-text-emphasis);
		background: var(--app-info-bg-subtle);

		&.deep-level {
			color: var(--app-dark-text-emphasis);
			background: var(--app-dark-bg-subtle);
			font-style: italic;
		}
	}

	tr.summary {
		font-weight: bold;

		& > td:first-child {
			padding-left: 20px;
		}
	}
</style>
