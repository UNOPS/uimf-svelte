<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import type { IFieldMetadata, IComponent } from '$lib/Infrastructure/uimf';

	interface Configuration {
		Inner: IComponent;
	}

	export let controller: OutputController<any, IFieldMetadata<Configuration>>;

	class Field {
		component: any;
		controller: any;
	}

	let component = new OutputComponent({
		refresh() {
			display = buildField(
				controller.metadata.Component.Configuration.Inner,
				controller.value?.Value
			);

			action = buildField(
				{
					Type: 'formlink',
					Configuration: null
				},
				controller.value?.Action
			);

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	let display: Field;
	let action: Field;

	function buildField(metadata: IComponent, value: any): any {
		const componentRegistration = controlRegister.outputs[metadata.Type];

		if (componentRegistration == null) {
			throw `Cannot find output for type '${metadata.Type}'.`;
		}

		return {
			component: componentRegistration.component,
			controller: new OutputController<any>({
				metadata: {
					Component: metadata,
					Hidden: false,
					Id: Date.now().toString(),
					Label: '',
					OrderIndex: 0,
					Required: false
				},
				data: value,
				form: controller.form,
				app: controller.app
			})
		};
	}
</script>

{#if display != null}
	<svelte:component this={display.component} controller={display.controller} />
{/if}

{#if action != null}
	<svelte:component this={action.component} controller={action.controller} />
{/if}
