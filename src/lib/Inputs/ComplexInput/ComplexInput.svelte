<script lang="ts" context="module">
	import { IComplexLayoutArea } from '../../Infrastructure/Metadata/ComplexLayout';
	import { IInputFieldMetadata } from '../../Infrastructure/Metadata';

	export { ComplexInputController as Controller } from './ComplexInputController';

	export interface IComplexLayoutMetadata {
		CssClass: string;
		Fields: IComplexLayoutField[];
		Areas?: IComplexLayoutArea[];
	}

	interface IComplexLayoutField {
		IsInput: boolean;
		Metadata: IInputFieldMetadata;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';

	import { InputComponent } from '../../Infrastructure/Component';
	import Input from '../../Input.svelte';
	import type { ComplexInputController } from './ComplexInputController';
	import { InputController } from '../../Infrastructure/InputController';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import Output from '../../Output.svelte';

	export let controller: ComplexInputController;

	interface IComplexInputFieldMetadata {
		CustomProperties?: {
			ComplexInputItem?: {
				Area: string;
			};
		};
	}

	type NestedField = {
		isInput: boolean;
		metadata: any;
		controller: InputController<any> | OutputController<any>;
	};

	let areas: { Area: IComplexLayoutArea | null; Items: NestedField[] }[] = [];

	let component = new InputComponent({
		refresh() {
			let fields = controller.views
				.filter((t) => !t.metadata.Hidden)
				.sort((a, b) => a.metadata.OrderIndex - b.metadata.OrderIndex);

			let areaDictionary: Record<
				string,
				{ Area: IComplexLayoutArea | null; Fields: NestedField[] }
			> = {};

			for (let i = 0; i < fields.length; i++) {
				const field = fields[i];
				let metadata = field.metadata as IComplexInputFieldMetadata;
				let areaName = metadata.CustomProperties?.ComplexInputItem?.Area ?? null;

				// Make sure key is not null.
				const key = areaName ?? '';

				if (!areaDictionary[key]) {
					let area =
						controller.metadata.Component.Configuration.Areas?.find((t) => t.Name == areaName) ??
						null;

					areaDictionary[key] = {
						Area: area,
						Fields: []
					};
				}

				const area = areaDictionary[key];

				if (area.Area?.FieldCssClass != null) {
					field.metadata.CssClass ??= '';
					field.metadata.CssClass += ' ' + area.Area.FieldCssClass;
				}

				areaDictionary[key].Fields.push(field);
			}

			// Sort `results` entries by `Area.OrderIndex` and put in array.
			areas = Object.entries(areaDictionary)
				.map(([_, value]) => {
					return { Area: value.Area, Items: value.Fields };
				})
				.sort((a, b) => (a.Area?.OrderIndex ?? 0) - (b.Area?.OrderIndex ?? 0));
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});

	function asInput(controller: any): InputController<any> {
		return controller as InputController<any>;
	}

	function asOutput(controller: any): OutputController<any> {
		return controller as OutputController<any>;
	}
</script>

<div class={controller.metadata.Component.Configuration?.CssClass} class:complex-input={true}>
	{#each areas as area}
		<div class={area.Area?.AreaCssClass}>
			{#each area.Items as view}
				{#if view.isInput}
					<Input controller={asInput(view.controller)} />
				{:else}
					<Output controller={asOutput(view.controller)} />
				{/if}
			{/each}
		</div>
	{/each}
</div>

<style lang="scss">
	.column-200 {
		width: 200px;
	}

	.column-300 {
		width: 300px;
	}

	.column-700 {
		width: 700px;
	}

	// Do not display empty areas.
	.complex-input > div:not(:has(*)) {
		display: none;
	}
</style>
