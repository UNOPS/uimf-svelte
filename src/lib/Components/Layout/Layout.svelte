<script lang="ts" context="module">
	import type { IInputFieldMetadata, IOutputFieldMetadata } from '../../Infrastructure/Metadata';
	import type { InputController } from '../../Infrastructure/InputController';
	import type { OutputController } from '../../Infrastructure/OutputController';

	import type { ILayoutArea } from './Metadata/ILayoutArea';
	import type { ILayoutContainer } from './Metadata/ILayoutContainer';
	import type { ILayoutFieldCustomProperties } from './Metadata/ILayoutFieldCustomProperties';
	import type { ILayoutItem } from './Metadata/ILayoutItem';

	interface ILayoutOutputFieldMetadata extends IOutputFieldMetadata {
		CustomProperties?: ILayoutFieldCustomProperties;
	}

	interface ILayoutInputFieldMetadata extends IInputFieldMetadata {
		CustomProperties?: ILayoutFieldCustomProperties;
	}

	export interface LayoutFieldInstance {
		isInput: boolean;
		metadata: ILayoutInputFieldMetadata | ILayoutOutputFieldMetadata;
		controller:
			| InputController<any, ILayoutInputFieldMetadata>
			| OutputController<any, ILayoutOutputFieldMetadata>;
	}

	export interface LayoutAreaInstance {
		Area: ILayoutArea | null;
		Fields: LayoutFieldInstance[];
	}

	export interface LayoutInstance {
		/**
		 * Root-level containers from backend (matches ParseLayout return type).
		 */
		Containers: ILayoutContainer[];
		/**
		 * Map of area name to area instance with associated fields.
		 * Used to lookup field controllers when rendering areas.
		 */
		AreaInstances: Map<string, LayoutAreaInstance>;
	}

	export type LayoutViewData = { [key: string]: any };
</script>

<script lang="ts">
	import LayoutArea from './LayoutArea.svelte';

	export let layout: LayoutInstance;

	function asContainer(item: ILayoutItem): ILayoutContainer {
		return item as ILayoutContainer;
	}

	function asArea(item: ILayoutItem): ILayoutArea {
		return item as ILayoutArea;
	}
</script>

{#if layout != null}
	{#each layout.Containers as parent}
		{#if parent.Type === 'container'}
			{@const container = asContainer(parent)}
			<div class={container.CssClass} class:ui-container={true}>
				{#each container.Children as child}
					{#if child.Type === 'container'}
						<svelte:self layout={{ Containers: [child], AreaInstances: layout.AreaInstances }} />
					{:else if child.Type === 'area'}
						{@const area = asArea(child)}
						{@const areaInstance = layout.AreaInstances.get(area.Name)}

						{#if areaInstance != null}
							<LayoutArea area={areaInstance} />
						{/if}
					{/if}
				{/each}
			</div>
		{:else if parent.Type === 'area'}
			{@const area = asArea(parent)}
			{@const areaInstance = layout.AreaInstances.get(area.Name)}

			{#if areaInstance != null}
				<LayoutArea area={areaInstance} />
			{/if}
		{/if}
	{/each}
{/if}
