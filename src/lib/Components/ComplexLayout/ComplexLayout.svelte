<script lang="ts" context="module">
	import { InputController } from '../../Infrastructure/InputController';
	import { OutputController } from '../../Infrastructure/OutputController';
	import type { IInputFieldMetadata } from '../../Infrastructure/Metadata/IInputFieldMetadata';
	import type { IOutputFieldMetadata } from '../../Infrastructure/Metadata/IOutputFieldMetadata';
	import Input from '../../Input.svelte';
	import Output from '../../Output.svelte';

	export interface IComplexLayoutField {
		IsInput: boolean;
		Metadata: IInputFieldMetadata | IOutputFieldMetadata;
	}

	/**
	 * Base interface for items that can appear in a layout container.
	 * Matches backend ILayoutItem interface.
	 */
	export interface ILayoutItem {
		Type: 'area' | 'container';
	}

	/**
	 * Represents a single area inside a complex layout.
	 * Matches backend LayoutArea class.
	 */
	export interface IComplexLayoutArea extends ILayoutItem {
		Type: 'area';
		Name: string | null;
		AreaCssClass: string | null;
		FieldCssClass: string | null;
		OrderIndex: number;
	}

	/**
	 * Represents a container that can hold multiple layout items (areas or nested containers).
	 * Matches backend LayoutContainer class.
	 */
	export interface ILayoutContainer extends ILayoutItem {
		Type: 'container';
		CssClass: string | null;
		Children: ILayoutItem[];
	}

	export interface IComplexLayout {
		CssClass: string;
		Fields: IComplexLayoutField[];
		/**
		 * Root-level containers returned from ComplexLayoutParser.ParseLayout().
		 * Changed from flat Areas array to support nested container structure.
		 */
		Containers?: ILayoutContainer[] | null;
	}

	export interface NestedField {
		isInput: boolean;
		metadata: IComplexInputFieldMetadata | IComplexOutputFieldMetadata;
		controller:
			| InputController<any, IComplexInputFieldMetadata>
			| OutputController<any, IComplexOutputFieldMetadata>;
	}

	export interface ComplexLayoutAreaInstance {
		Area: IComplexLayoutArea | null;
		Items: NestedField[];
	}

	export interface ComplexLayoutInstance {
		/**
		 * Root-level containers from backend (matches ParseLayout return type).
		 */
		Containers: ILayoutContainer[];
		/**
		 * Map of area name to area instance with associated fields.
		 * Used to lookup field controllers when rendering areas.
		 */
		AreaInstances: Map<string, ComplexLayoutAreaInstance>;
	}

	export interface IComplexOutputFieldMetadata extends IOutputFieldMetadata {
		CustomProperties?: {
			ComplexLayoutItem?: {
				Area: string;
			};
		};
	}

	export interface IComplexInputFieldMetadata extends IInputFieldMetadata {
		CustomProperties?: {
			ComplexLayoutItem?: {
				Area: string;
			};
		};
	}

	export type ComplexLayoutViewData = { [key: string]: any };

	function asInput(controller: any): InputController<any> {
		return controller as InputController<any>;
	}

	function asOutput(controller: any): OutputController<any> {
		return controller as OutputController<any>;
	}
</script>

<script lang="ts">
	export let layout: ComplexLayoutInstance;

	/**
	 * Type guard to check if a layout item is an area.
	 */
	function isArea(item: ILayoutItem): item is IComplexLayoutArea {
		return item.Type === 'area';
	}

	/**
	 * Type guard to check if a layout item is a container.
	 */
	function isContainer(item: ILayoutItem): item is ILayoutContainer {
		return item.Type === 'container';
	}

	/**
	 * Recursively renders layout items (containers or areas).
	 * Containers render as div elements with their children.
	 * Areas render their associated fields.
	 */
	function renderItem(item: ILayoutItem, areaInstances: Map<string, ComplexLayoutAreaInstance>) {
		if (isContainer(item)) {
			return {
				type: 'container' as const,
				cssClass: item.CssClass,
				children: item.Children
			};
		} else if (isArea(item)) {
			const areaInstance = areaInstances.get(item.Name ?? '');
			return {
				type: 'area' as const,
				areaCssClass: item.AreaCssClass,
				items: areaInstance?.Items ?? []
			};
		}
		return null;
	}
</script>

{#if layout != null}
	{#each layout.Containers as container}
		{@const rendered = renderItem(container, layout.AreaInstances)}
		{#if rendered?.type === 'container'}
			<div class={rendered.cssClass}>
				{#each rendered.children as child}
					{@const childRendered = renderItem(child, layout.AreaInstances)}
					{#if childRendered?.type === 'container'}
						<svelte:self layout={{ Containers: [child], AreaInstances: layout.AreaInstances }} />
					{:else if childRendered?.type === 'area'}
						<div class={childRendered.areaCssClass} class:complex-layout-area={true}>
							{#each childRendered.items as field}
								{#if field.isInput}
									<Input controller={asInput(field.controller)} />
								{:else}
									<Output controller={asOutput(field.controller)} />
								{/if}
							{/each}
						</div>
					{/if}
				{/each}
			</div>
		{:else if rendered?.type === 'area'}
			<div class={rendered.areaCssClass} class:complex-layout-area={true}>
				{#each rendered.items as field}
					{#if field.isInput}
						<Input controller={asInput(field.controller)} />
					{:else}
						<Output controller={asOutput(field.controller)} />
					{/if}
				{/each}
			</div>
		{/if}
	{/each}
{/if}

<style lang="scss">
	// Do not display empty areas.
	.complex-layout-area:not(:has(*)) {
		display: none;
	}
</style>
