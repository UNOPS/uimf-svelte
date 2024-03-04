<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import type { IFieldMetadata, IComponent } from '../Infrastructure/uimf';

	export let controller: OutputController<any, IFieldMetadata<Configuration>>;

	interface Configuration {
		Inner: IComponent;
	}

	class ComponentController {
		component: any;
		controller: any;
	}

	let component = new OutputComponent({
		refresh() {
			componentController = getComponentController(
				controller.metadata.Component.Configuration.Inner
			);

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	let componentController: ComponentController;

	function getComponentController(inner: IComponent): any {
		let componentController: ComponentController = {
			component: controlRegister.outputs[inner.Type].component,
			controller: new OutputController<any>({
				metadata: {
					Hidden: false,
					Id: Date.now().toString(),
					Label: '',
					OrderIndex: 0,
					Required: false,
					Component: inner
				},
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
