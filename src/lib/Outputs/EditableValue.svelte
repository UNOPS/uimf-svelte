<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';

	export let controller: OutputController<any>;

	class ComponentController {
		component: any;
		controller: any;
	}

	let component = new OutputComponentController({
		refresh() {
			componentController = BuildComponentController(
				controller.metadata.CustomProperties.ItemTypes[0].Type
			);

			actionController = BuildActionController(
				controller.metadata.CustomProperties.ItemTypes[0].Type
			);
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	let componentController: ComponentController = BuildComponentController(
		controller.metadata.CustomProperties.ItemTypes[0].Type
	);

	let actionController: ComponentController = BuildActionController('formlink');

	function BuildComponentController(type: string): any {
		let componentController = {
			component: controlRegister.outputs[type].component,
			controller: new OutputController<any>({
				metadata: controller.value?.Value,
				data: null,
				form: controller.form!,
				app: controller.app
			})
		};

		if (controller.value != null && controller.value.Value != undefined) {
			componentController.controller.setValue(controller.value?.Value);
		}

		return componentController;
	}

	function BuildActionController(type: string): any {
		let componentController = {
			component: controlRegister.outputs[type].component,
			controller: new OutputController<any>({
				metadata: controller.value?.Action,
				data: null,
				form: controller.form!,
				app: controller.app
			})
		};

		if (controller.value != null && controller.value.Action != undefined) {
			componentController.controller.setValue(controller.value?.Action);
		}

		return componentController;
	}
</script>

{#if controller.value != null}
	{#if componentController != null}
		<svelte:component
			this={componentController.component}
			controller={componentController.controller}
		/>
		<span class="position {controller.value.CssClass}">
			<svelte:component
				this={actionController.component}
				controller={actionController.controller}
			/>
		</span>
	{/if}
{/if}

<style lang="scss">
	.position {
		margin-left: 2px;
	}
	.edit {
		color: darkorange;
	}
</style>
