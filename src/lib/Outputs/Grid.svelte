<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import type { IFieldMetadata } from '$lib/Infrastructure/uimf';

	interface OutputField {
		component: any;
		controller: any;
	}

	interface Configuration {
		Properties: IFieldMetadata[];
		Areas: string;
		Rows: string;
		Columns: string;
	}

	class GridController extends OutputController<any, IFieldMetadata<Configuration>> {}

	export let controller: GridController;

	let fields: OutputField[];

	let component = new OutputComponent({
		refresh() {
			fields = getComponentControllers();
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function getComponentControllers(): OutputField[] {
		if (controller.value == null) {
			return [];
		}

		return controller.metadata.Component.Configuration.Properties.sort(
			(a, b) => a.OrderIndex - b.OrderIndex
		).map((property) => {
			const field = controlRegister.createOutput({
				props: {
					metadata: property,
					app: controller.app,
					form: controller.form,
					data: null
				}
			});

			if (controller.value != null) {
				field.controller.setValue(controller.value[property.Id]);
			}

			return field;
		});
	}
</script>

{#if fields?.length > 0}
	<div
		class="layout"
		style:grid-template-areas={controller.metadata.Component.Configuration.Areas}
		style:grid-template-rows={controller.metadata.Component.Configuration.Rows}
		style:grid-template-columns={controller.metadata.Component.Configuration.Columns}
	>
		{#each fields as field}
			<div style:grid-area={field.controller.metadata.CustomProperties?.gridArea}>
				{#if field.controller.metadata.Label != null}
					<h3>{field.controller.metadata.Label}</h3>
				{/if}
				<svelte:component this={field.component} controller={field.controller} />
			</div>
		{/each}
	</div>
{/if}

<style lang="scss">
	.layout {
		display: grid;
		grid-gap: 10px;

		& > div {
			& > h3 {
				padding: 5px 10px;
				border-bottom: 2px solid #cbdce9;
				font-weight: 400;
				font-size: 1.1em;
			}
		}
	}
</style>
