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

	interface FlexboxMetadata extends ComponentMetadata {
		CustomProperties: {
			Fields: ComponentMetadata[];
			cssClass: string;
		};
	}

	class FlexboxController extends OutputController<any> {
		declare metadata: FlexboxMetadata;
	}

	export let controller: FlexboxController;

	let fields: OutputField[];

	let component = new OutputComponentController({
		refresh() {
			fields = getComponentControllers();
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function getComponentControllers(): OutputField[] {
		if (controller.value?.Value == null) {
			return [];
		}

		return controller.metadata.CustomProperties.Fields.sort(
			(a, b) => a.OrderIndex - b.OrderIndex
		).map((item) => {
			const entry = controlRegister.outputs[item.Type];

			if (entry == null) {
				throw `No component available for output of type "${item.Type}".`;
			}

			let field = {
				component: entry.component,
				controller: new OutputController<any>({
					metadata: item,
					data: null,
					form: controller.form,
					app: controller.app
				})
			};

			if (controller.value?.Value != null) {
				field.controller.setValue(controller.value?.Value[item.Id]);
			}

			return field;
		});
	}
</script>

{#if fields?.length > 0}
	<div class="flex-container {controller.metadata.CustomProperties.cssClass}">
		{#each fields as field}
			<div class="flex-item">
				<svelte:component this={field.component} controller={field.controller} />
			</div>
		{/each}
	</div>
{/if}

<style lang="scss">
	.flex-container {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
	}

	.flex-item {
		margin: 5px;
		padding-top: 10px;
		padding-bottom: 15px;
		display: flex;
		justify-content: left;
		flex-direction: column;
		flex-basis: 580px;
		border: 1px solid #b1b1b1;
    	box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
	}

	.horizontal {
		flex-direction: row;
	}

	.vertical {
		flex-direction: column;
	}
</style>
