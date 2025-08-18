<script context="module" lang="ts">
	interface IExtendedOutputFieldMetadata<TConfig, TExtras = undefined>
		extends IOutputFieldMetadata<TConfig> {
		Extras?: TExtras;
	}

	class RowMetadata {
		public Metadata!: IExtendedOutputFieldMetadata<
			IMatrixConfiguration,
			{
				MatrixData?: { IsSummary: boolean };
				Documentation?: string;
			} | null
		>;

		public Path!: string | null;
		public OrderIndex!: number;
		public Level!: number;
	}

	export interface IMatrixConfiguration extends IOutputFieldMetadata {
		Properties: IOutputFieldMetadata[];
	}

	export interface IMatrix {
		Items: any[];
	}
</script>

<script lang="ts">
	import Output from '../../Output.svelte';
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { tooltip } from '../../Components/Tooltip.svelte';
	import type { IOutputFieldMetadata } from '../../Infrastructure/Metadata';
	import { OutputComponent } from '../../Infrastructure/Component';

	export let controller: OutputController<IMatrix, IMatrixConfiguration>;

	let columns: { [key: string]: OutputController<any, IOutputFieldMetadata<any>> }[] = [];
	let rows: RowMetadata[] = [];
	let colgroups: { span: number; style?: string }[] = [];
	let isColored = false;

	function getColor(index: number): string {
		const colors = ['#fff9e6', '#eaf7ee', '#e8f7fa', '#fcebec'];
		return colors[index % colors.length];
	}

	function getRows(
		properties: IOutputFieldMetadata<IMatrixConfiguration>[],
		level: number | null = null
	): RowMetadata[] {
		var result: RowMetadata[] = [];
		level = level || 1;

		let orderIndex: number = 0;
		let propertiesSorted = properties.sort((a, b) => a.OrderIndex - b.OrderIndex);

		for (let property of propertiesSorted) {
			// flatten list
			if (
				controller.metadata.Component.Configuration.FlattenLists &&
				property.Component.Type == 'table'
			) {
				const sampleItem = controller?.value?.Items?.[0];
				var propertyId = property.Id;

				if (sampleItem !== undefined && sampleItem[propertyId]?.length) {
					for (let i = 0; i < sampleItem[propertyId].length; i++) {
						const field = sampleItem[propertyId][i];
						let value = Object.keys(sampleItem[propertyId][i])[1];

						result.push({
							OrderIndex: orderIndex++,
							Path: `${[propertyId]}[${i}].${value}`,
							Metadata: {
								...property.Component.Configuration.Columns[1],
								Id: `${[propertyId]}[${i}].${value}`,
								Label: field.Label
							},
							Level: level
						});
					}
				}
			} else if (property.Component.Type === 'matrix-data') {
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

	function getPropertyValue(object: any, propertyPath: string) {
		try {
			return propertyPath
				.split(/[\.\[\]]/)
				.filter(Boolean)
				.reduce((a, b) => a?.[b], object);
		} catch {
			return null;
		}
	}

	const componentController = new OutputComponent({
		refresh() {
			controller.value = controller.value;

			rows = getRows(controller.metadata.Component.Configuration.Properties);
			isColored = controller.metadata.Component.Configuration.IsColored;

			if (controller?.value?.Items != null) {
				columns = [];
				colgroups = [];

				for (let item of controller.value.Items) {
					var column: any = {};

					for (let row of rows) {
						if (row.Path == null) {
							continue;
						}

						if (row.Path.includes('.')) {
							column[row.Path] = new OutputController({
								metadata: row.Metadata,
								data: getPropertyValue(item, row.Path),
								form: controller.form,
								app: controller.app,
								parent: controller
							});
						} else {
							column[row.Path] = new OutputController({
								metadata: row.Metadata,
								data: item[row.Metadata.Id],
								form: controller.form,
								app: controller.app,
								parent: controller
							});
						}
					}

					columns.push(column);

					if (isColored) {
						colgroups.push({
							span: 1,
							style: `background-color: ${getColor(columns.length - 1)}`
						});
					}
				}
			} else {
				columns = [];
				rows = [];
			}

			return Promise.resolve();
		}
	});

	beforeUpdate(async () => {
		await componentController.setup(controller);
	});
</script>

{#if columns?.length > 0 && rows?.length > 0}
	<div class="table-responsive">
		<table class="table table-bordered" class:table-striped={!isColored}>
			<colgroup />
			{#each colgroups as col}
				<colgroup span={col.span} style={col.style} />
			{/each}

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
									{#if row.Path !== null}
										<Output controller={column[row.Path]} nolayout={true} />
									{/if}
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
		white-space: wrap;
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
