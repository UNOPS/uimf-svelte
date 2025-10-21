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

	export interface IComplexLayout {
		CssClass: string;
		Fields: IComplexLayoutField[];
		Areas?: IComplexLayoutArea[] | null;
	}

	export interface IComplexLayoutArea {
		Name: string | null;
		AreaCssClass: string | null;
		FieldCssClass: string | null;
		OrderIndex: number;
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
		Areas: ComplexLayoutAreaInstance[];
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
</script>

{#each layout.Areas as area}
	<div class={area.Area?.AreaCssClass} class:complex-layout-area={true}>
		{#each area.Items as field}
			{#if field.isInput}
				<Input controller={asInput(field.controller)} />
			{:else}
				<Output controller={asOutput(field.controller)} />
			{/if}
		{/each}
	</div>
{/each}

<style lang="scss">
	// Do not display empty areas.
	.complex-layout-area:not(:has(*)) {
		display: none;
	}
</style>
