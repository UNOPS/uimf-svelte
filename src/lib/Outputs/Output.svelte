<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import type { ComponentMetadata } from '../Infrastructure/uimf';

	export let controller: OutputController<any>;

	class ComponentController {
		component: any;
		controller: any;
	}

	let component = new OutputComponentController({
		refresh() {
			componentController = getComponentController(
				controller.metadata.CustomProperties?.NestedMetadata ??
					controller.metadata.CustomProperties.ItemTypes.CustomProperties.NestedMetadata
			);

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	
	let componentController: ComponentController;

	function getComponentController(nestedMetadata: ComponentMetadata): any {
		let componentController: ComponentController = {
					component: controlRegister.outputs[nestedMetadata.Type].component,
					controller: new OutputController<any>({
						metadata: nestedMetadata,
						data: null,
						form: controller.form!,
						app: controller.app
					})
				};
				
				componentController.controller.setValue(controller.value?.Value);
				
		return componentController;
	}
</script>

{#if componentController != null}
	<div class={controller.metadata.CustomProperties?.cssClass}>
			<div class={componentController.controller.metadata.CustomProperties?.cssClass}>
				<svelte:component
					this={componentController.component}
					controller={componentController.controller}
				/>
			</div>
	</div>
{/if}
