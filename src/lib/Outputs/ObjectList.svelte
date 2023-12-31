<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';

	export let controller: OutputController<any>;

	class ComponentController {
		component: any;
		controller: any;
	}

	let componentControllers: ComponentController[] = [];

	if (controller.value?.Items != null) {
		componentControllers = getComponentControllers(controller.value.Items);
	}

	let component = new OutputComponent({
		refresh() {
			if (controller.value?.Items != null) {
				componentControllers = getComponentControllers(controller.value.Items);
			} else {
				componentControllers = [];
			}

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function getComponentControllers(items: any[]): any[] {
		let componentControllerArray: ComponentController[] = [];

		let nestedComponentType = controller.metadata.CustomProperties.ItemTypes.Type;

		if (controlRegister.outputs[nestedComponentType] != undefined) {
			let nestedComponent = controlRegister.outputs[nestedComponentType].component;

			items.forEach((item) => {
				let componentController = {
					component: nestedComponent,
					controller: new OutputController<any>({
						metadata: controller.metadata,
						data: null,
						form: controller.form!,
						app: controller.app
					})
				};

				componentController.controller.setValue(item);
				componentControllerArray.push(componentController);
			});
		}

		return componentControllerArray;
	}
</script>

{#if componentControllers?.length > 0}
	{#each componentControllers as componentController}
		<div class={componentController.controller.metadata.CustomProperties.cssClass}>
			<svelte:component
				this={componentController.component}
				controller={componentController.controller}
			/>
		</div>
	{/each}
{/if}

<style>
	.line-separator {
		display: list-item;
		list-style-type: none;
		border-bottom: 0.1rem solid #4cb0e3;
		padding: 10px;
	}

	.bullet-list {
		display: list-item;
		list-style-type: circle;
		margin-left: 1.3em;
	}

	.label {
		font-weight: bold;
		font-size: medium;
		color: black;
		text-align: left;
		padding: 0.6em 0em 0em;
	}

	/* optional css from CustomProperties.cssClass */
	.comma-separated-list > div {
		display: inline;
	}

	.comma-separated-list > div:last-child::after {
		content: none;
	}

	.comma-separated-list > div::after {
		content: ', ';
	}
</style>
