<script context="module" lang="ts">
	import type { IComponent, IOutputFieldMetadata } from '../../Infrastructure/Metadata';

	export interface IMatrixConfiguration {
		RowGroups: IRowGroup[];
		CssClass: string | null;
	}

	export interface IRowGroup {
		Label?: string | null;
		OrderIndex: number;
		Rows?: IRowGroup[] | null;
		Path?: string | null;
		Metadata?: IOutputFieldMetadata | null;
		IsDynamic: boolean;
		IsRowGroupCollection: boolean;
		ItemMetadata?: IComponent | null;
	}

	export interface IMatrixData {
		Items: any[];
	}

	interface FlatRowBase {
		level: number;
		orderIndex: number;
	}

	interface HeaderRow extends FlatRowBase {
		type: 'header';
		label: string;
	}

	interface DataRow extends FlatRowBase {
		type: 'data';
		path: string;
		metadata: IOutputFieldMetadata;
	}

	interface DynamicRow extends FlatRowBase {
		type: 'dynamic';
		path: string;
		metadata: IComponent;
	}

	interface RowGroupCollectionRow extends FlatRowBase {
		type: 'row-group-collection';
		path: string;
		metadata: IComponent;
	}

	type FlatRow = HeaderRow | DataRow | DynamicRow | RowGroupCollectionRow;
</script>

<script lang="ts">
	import Output from '../../Output.svelte';
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { tooltip } from '../../Components/Tooltip.svelte';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { OutputFieldMetadataFactory } from '../../Infrastructure/Utilities/OutputFieldMetadataFactory';

	export let controller: OutputController<IMatrixData, IOutputFieldMetadata<IMatrixConfiguration>>;

	let columns: { [key: string]: OutputController<any, IOutputFieldMetadata<any>> }[] = [];
	let flatRows: FlatRow[] = [];
	let dynamicKeysByPath: Map<string, Set<string>> = new Map(); // Track unique keys organized by row path
	let rowGroupCollectionsByPath: Map<string, Map<string, Set<string>>> = new Map(); // Track groups and keys organized by row path

	/**
	 * Flattens the hierarchical RowGroup structure into a linear array for rendering.
	 */
	function flattenRowGroups(groups: IRowGroup[], level: number = 0): FlatRow[] {
		const result: FlatRow[] = [];

		for (const group of groups.sort((a, b) => a.OrderIndex - b.OrderIndex)) {
			if (group.Label) {
				// This is a group header row
				result.push({
					type: 'header',
					label: group.Label,
					level: level,
					orderIndex: group.OrderIndex
				} as HeaderRow);
			}

			if (group.Rows && group.Rows.length > 0) {
				// Recursively flatten nested rows
				result.push(...flattenRowGroups(group.Rows, level + 1));
			} else if (group.IsRowGroupCollection && group.ItemMetadata) {
				// This is a MatrixRowGroupCollection - will be expanded dynamically with groups
				result.push({
					type: 'row-group-collection',
					path: group.Path!,
					metadata: group.ItemMetadata,
					level: level,
					orderIndex: group.OrderIndex
				} as RowGroupCollectionRow);
			} else if (group.IsDynamic && group.ItemMetadata) {
				// This is a MatrixDataList - will be expanded dynamically
				result.push({
					type: 'dynamic',
					path: group.Path!,
					metadata: group.ItemMetadata,
					level: level,
					orderIndex: group.OrderIndex
				} as DynamicRow);
			} else if (group.Path && group.Metadata) {
				// Regular data row
				result.push({
					type: 'data',
					path: group.Path,
					metadata: group.Metadata,
					level: level,
					orderIndex: group.OrderIndex
				} as DataRow);
			}
		}

		return result;
	}

	/**
	 * Extracts a property value from an object using a dot-notation path.
	 */
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

	/**
	 * Builds column data with OutputController instances for each cell.
	 * Collects dynamic keys while building controllers in a single pass.
	 */
	function buildColumns(items: any[]) {
		dynamicKeysByPath.clear();
		rowGroupCollectionsByPath.clear();

		return items.map((item) => {
			const column: any = {};

			for (const row of flatRows) {
				if (row.type === 'data' && row.path) {
					// Regular data row
					const value = getPropertyValue(item, row.path);
					column[row.path] = new OutputController({
						metadata: row.metadata,
						data: value,
						form: controller.form,
						app: controller.app,
						parent: controller
					});
				} else if (row.type === 'row-group-collection' && row.path && row.metadata) {
					// MatrixRowGroupCollection - create controller for each group's key-value pairs
					const rowGroupCollection = getPropertyValue(item, row.path);
					if (rowGroupCollection?.Items) {
						// Initialize Map for this path if needed
						if (!rowGroupCollectionsByPath.has(row.path)) {
							rowGroupCollectionsByPath.set(row.path, new Map<string, Set<string>>());
						}

						const groupsByPath = rowGroupCollectionsByPath.get(row.path)!;

						for (const groupItem of rowGroupCollection.Items) {
							const groupLabel = groupItem.Label;

							// Initialize Set for this group label if needed
							if (!groupsByPath.has(groupLabel)) {
								groupsByPath.set(groupLabel, new Set<string>());
							}

							const keysForThisGroup = groupsByPath.get(groupLabel)!;

							if (groupItem.Rows) {
								for (const [key, value] of Object.entries(groupItem.Rows)) {
									// Collect the key AND create the controller
									keysForThisGroup.add(key);

									column[`${row.path}|${groupLabel}|${key}`] = new OutputController({
										metadata: OutputFieldMetadataFactory.fromComponent(row.metadata),
										data: value,
										form: controller.form,
										app: controller.app,
										parent: controller
									});
								}
							}
						}
					}
				} else if (row.type === 'dynamic' && row.path && row.metadata) {
					// MatrixDataList - create controller for each key-value pair
					const dataList = getPropertyValue(item, row.path);
					if (dataList?.Values) {
						// Initialize Set for this path if needed
						if (!dynamicKeysByPath.has(row.path)) {
							dynamicKeysByPath.set(row.path, new Set<string>());
						}

						const keysForThisPath = dynamicKeysByPath.get(row.path)!;

						for (const [key, value] of Object.entries(dataList.Values)) {
							// Collect the key AND create the controller
							keysForThisPath.add(key);

							column[`${row.path}|${key}`] = new OutputController({
								metadata: OutputFieldMetadataFactory.fromComponent(row.metadata),
								data: value,
								form: controller.form,
								app: controller.app,
								parent: controller
							});
						}
					}
				}
			}

			return column;
		});
	}

	const componentController = new OutputComponent({
		refresh() {
			controller.value = controller.value;

			if (controller?.value?.Items != null && controller.value.Items.length > 0) {
				flatRows = flattenRowGroups(controller.metadata.Component.Configuration.RowGroups);
				columns = buildColumns(controller.value.Items);
			} else {
				flatRows = [];
				columns = [];
			}

			return Promise.resolve();
		}
	});

	beforeUpdate(async () => {
		await componentController.setup(controller);
	});
</script>

{#if columns?.length > 0 && flatRows?.length > 0}
	<div class="table-responsive">
		<table class="table table-bordered matrix-table">
			<tbody>
				{#each flatRows as row, rowIndex}
					{#if row.type === 'header'}
						<!-- Group header row -->
						<tr>
							<td
								class="group-row"
								class:second-level={row.level > 0}
								class:deep-level={row.level > 1}
								colspan={columns.length + 1}
								style:padding-left={Math.max(20, row.level * 20) + 'px'}
							>
								{row.label}
							</td>
						</tr>
					{:else if row.type === 'row-group-collection'}
						<!-- MatrixRowGroupCollection rows - expand dynamically based on groups and keys -->
						{#each Array.from(rowGroupCollectionsByPath.get(row.path)?.keys() ?? []) as groupLabel}
							<!-- Group header for this collection group -->
							<tr>
								<td
									class="group-row"
									class:second-level={row.level > 0}
									class:deep-level={row.level > 1}
									colspan={columns.length + 1}
									style:padding-left={Math.max(20, row.level * 20) + 'px'}
								>
									{groupLabel}
								</td>
							</tr>
							<!-- Rows within this group -->
							{#each Array.from(rowGroupCollectionsByPath
									.get(row.path)
									?.get(groupLabel) ?? []) as key}
								{@const keyPath = `${row.path}|${groupLabel}|${key}`}
								<tr>
									<td
										class="first-column"
										style:padding-left={Math.max(20, (row.level + 1) * 20) + 'px'}
									>
										{key}
									</td>
									{#each columns as column}
										<td class:first-row={rowIndex === 0}>
											{#if column[keyPath]}
												<Output controller={column[keyPath]} nolayout={true} />
											{/if}
										</td>
									{/each}
								</tr>
							{/each}
						{/each}
					{:else if row.type === 'dynamic'}
						<!-- MatrixDataList rows - expand dynamically based on keys -->
						{#each Array.from(dynamicKeysByPath.get(row.path) ?? []) as key}
							{@const keyPath = `${row.path}|${key}`}
							<tr>
								<td class="first-column" style:padding-left={Math.max(20, row.level * 20) + 'px'}>
									{key}
								</td>
								{#each columns as column}
									<td class:first-row={rowIndex === 0}>
										{#if column[keyPath]}
											<Output controller={column[keyPath]} nolayout={true} />
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					{:else}
						<!-- Regular data row -->
						<tr>
							<td
								use:tooltip={row.metadata?.Documentation}
								class="first-column"
								style:padding-left={Math.max(20, row.level * 20) + 'px'}
							>
								{row.metadata?.Label}
							</td>
							{#each columns as column}
								<td class:first-row={rowIndex === 0}>
									{#if row.path && column[row.path]}
										<Output controller={column[row.path]} nolayout={true} />
									{/if}
								</td>
							{/each}
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style lang="scss">
	.first-column {
		white-space: wrap;
		background-color: var(--bs-primary-bg-subtle);
		color: var(--bs-primary-text-emphasis);
		padding-left: 40px;
		border-right: 2px solid var(--bs-body-color);
	}

	.first-row {
		background-color: var(--bs-primary-bg-subtle);
		color: var(--bs-primary-text-emphasis);
		border-bottom: 2px solid var(--bs-body-color);
	}

	.table > tbody > tr:hover {
		background-color: var(--bs-tertiary-bg);
	}

	.group-row {
		color: var(--bs-info-bg-subtle);
		background: var(--bs-info-text-emphasis);
		padding: 10px 20px;
	}

	.second-level {
		font-size: 1em;
		padding: 6px 20px;
		color: var(--bs-info-text-emphasis);
		background: var(--bs-info-bg-subtle);

		&.deep-level {
			color: var(--bs-dark-text-emphasis);
			background: var(--bs-dark-bg-subtle);
			font-style: italic;
		}
	}
</style>
