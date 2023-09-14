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
			componentControllers = getComponentControllers(
				controller.metadata.CustomProperties.ItemTypes[0].Type
			);

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	let componentControllers: ComponentController[] = getComponentControllers(
		controller.metadata.CustomProperties.ItemTypes[0].Type
	);

	function getComponentControllers(type: string): any[] {
		let componentControllerArray: ComponentController[] = [];

		controller.value?.Value.forEach((item: any) => {
			let componentController = {
				component: controlRegister.outputs[type].component,
				controller: new OutputController<any>({
					metadata: item,
					data: null,
					form: controller.form!,
					app: controller.app
				})
			};

			if (controller.value != null && controller.value.Value != undefined) {
				componentController.controller.setValue(item);
				componentControllerArray.push(componentController);
			}
		});

		return componentControllerArray;
	}
</script>

{#if controller.value != null}
	{#if componentControllers != null}
		<div class={controller.metadata.CustomProperties?.cssClass}>
			{#each componentControllers as componentController, index}
					{#if index != 0}
						<span> {@html controller.value.Separator} </span> 
					{/if}
					<svelte:component
						this={componentController.component}
						controller={componentController.controller}
					/>
			{/each}
		</div>
	{/if}
{/if}
