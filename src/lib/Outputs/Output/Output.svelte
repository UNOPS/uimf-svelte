<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
	import type { IFieldMetadata, IComponent, IOutputFieldMetadata } from '../../Infrastructure/uimf';
	import { tooltip } from '../../Components/Tooltip.svelte';

	export let controller: OutputController<OutputData, IOutputFieldMetadata<Configuration>>;

	interface Configuration {
		Inner: IComponent;
	}

	interface OutputData {
		CssClass: string | null;
		Popover: string | null;
		Tooltip: string | null;
		Value: any;
	}

	class ComponentController {
		component: any;
		controller: any;
	}

	let component = new OutputComponent({
		refresh() {
			innerComponent = getInner(
				controller.metadata.Component.Configuration.Inner,
				controller.value?.Value
			);

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	let innerComponent: ComponentController;

	function getInner(component: IComponent, value: any): any {
		if (value == null) {
			// Do not display anything if the value is null.
			return null;
		}

		let inner: ComponentController = {
			component: controlRegister.outputs[component.Type].component,
			controller: new OutputController<any>({
				metadata: {
					Hidden: false,
					Id: Date.now().toString(),
					Label: '',
					OrderIndex: 0,
					Component: component
				},
				data: null,
				form: controller.form!,
				app: controller.app,
				parent: controller
			})
		};

		inner.controller.setValue(value);

		return inner;
	}
</script>

{#if innerComponent != null}
	<div class={controller.value.CssClass} use:tooltip={controller.value.Tooltip}>
		<svelte:component this={innerComponent.component} controller={innerComponent.controller} />
	</div>
{/if}
