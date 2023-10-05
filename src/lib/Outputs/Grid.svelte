<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import type { ComponentMetadata } from '$lib/Infrastructure/uimf';

	interface OutputField {
		component: any;
		controller: any;
	}

	interface GridMetadata extends ComponentMetadata {
		CustomProperties: {
			Properties: ComponentMetadata[];
			Customizations: {
				Areas: string;
				Rows: string;
				Columns: string;
			};
		};
	}

	class GridController extends OutputController<any> {
		declare metadata: GridMetadata;
	}

	export let controller: GridController;

	let fields: OutputField[];

	let component = new OutputComponentController({
		refresh() {
			fields = getComponentControllers();
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function getComponentControllers(): OutputField[] {
		console.log(controller.metadata);

		if (controller.value?.Value == null) {
			return [];
		}

		return controller.metadata.CustomProperties.Properties.sort(
			(a, b) => a.OrderIndex - b.OrderIndex
		).map((property) => {
			const entry = controlRegister.outputs[property.Type];

			if (entry == null) {
				throw `No component available for output of type "${property.Type}".`;
			}

			let field = {
				component: entry.component,
				controller: new OutputController<any>({
					metadata: property,
					data: null,
					form: controller.form,
					app: controller.app
				})
			};

			if (controller.value?.Value != null) {
				field.controller.setValue(controller.value?.Value[property.Id]);
			}

			return field;
		});
	}
</script>

{#if fields?.length > 0 && controller.metadata.CustomProperties?.Customizations != null}
	<div
		class="layout"
		style:grid-template-areas={controller.metadata.CustomProperties.Customizations.Areas}
		style:grid-template-rows={controller.metadata.CustomProperties.Customizations.Rows}
		style:grid-template-columns={controller.metadata.CustomProperties.Customizations.Columns}
	>
		{#each fields as field}
			<div style:grid-area={field.controller.metadata.CustomProperties?.Area}>
				<svelte:component this={field.component} controller={field.controller} />
			</div>
		{/each}
	</div>
{/if}

<style>
	.layout {
		display: grid;
	}
</style>
