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
				controller.metadata.CustomProperties.Properties
			);

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	let componentControllers: ComponentController[] = getComponentControllers(
		controller.metadata.CustomProperties.Properties
	);

	function getComponentControllers(properties: any[]): any[] {
		let componentControllerArray: ComponentController[] = [];

		properties
			.sort((a, b) => a.OrderIndex - b.OrderIndex)
			.forEach((property) => {
				let componentController = {
					component: controlRegister.outputs[property.Type].component,
					controller: new OutputController<any>({
						metadata: property,
						data: null,
						form: controller.form!,
						app: controller.app
					})
				};
				
				if (controller.value != null && controller.value.Value != undefined) {
					componentController.controller.setValue(controller.value?.Value[property.Id]);
					componentControllerArray.push(componentController);
				}
			});

		return componentControllerArray;
	}
</script>

{#if componentControllers != null}
	<div class={controller.metadata.CustomProperties?.cssClass}>
		{#each componentControllers as componentController}
			<div class={componentController.controller.metadata.CustomProperties?.cssClass}>
				{#if componentController.controller.metadata.Type == 'text' && componentController.controller.metadata.CustomProperties?.cssClass != null}
					<svelte:component
						this={componentController.component}
						controller={componentController.controller}
						showLabel={componentController.controller.metadata.CustomProperties?.cssClass.includes(
							'show-label'
						)}
					/>
				{/if}

				<svelte:component
					this={componentController.component}
					controller={componentController.controller}
				/>
			</div>
		{/each}
	</div>
{/if}

<style>
	/* Layout parent class that must be applied on the parent component */
	.layout-container {
		display: grid;
		grid-template-rows: auto 1fr;
		grid-template-columns: 25% 75%;
		height: 100%;
	}

	.layout-container.size35-65 {
		grid-template-columns: 35% 65% !important;
	}

	/* set a sub classes to be applied on child component/element */
	.layout-left {
		grid-row: 1;
		grid-column: 1;
		padding: 5px;
		margin: 5px;
	}

	.layout-right {
		grid-row: 1;
		grid-column: 2;
		padding: 5px;
		margin: 5px;
	}

	.layout-lower-half {
		grid-row: 2;
		grid-column: 1 / span 2;
		padding: 5px;
		margin: 5px;
	}

	.new-line {
		margin-bottom: 10px;
	}

	.small-font {
		font-size: 14px;
	}
</style>
