<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import { defaultControlRegister as controlRegister } from '../Infrastructure/ControlRegister';
	import type { ComponentMetadata } from '$lib/Infrastructure/uimf';

	export let controller: OutputController<any>;

	class Field {
		component: any;
		controller: any;
	}

	let component = new OutputComponentController({
		refresh() {
			display = buildField(controller.metadata.CustomProperties.ValueType, controller.value?.Value);

			action = buildField(
				{
					Type: 'formlink',
					CustomProperties: null,
					Hidden: false,
					Id: 'Action',
					Label: '',
					OrderIndex: 10,
					Required: false
				},
				controller.value?.Action
			);

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	let display: Field;
	let action: Field;

	function buildField(metadata: ComponentMetadata, value: any): any {
		const componentRegistration = controlRegister.outputs[metadata.Type];

		if (componentRegistration == null) {
			throw `Cannot find output for type '${metadata.Type}'.`;
		}

		return {
			component: componentRegistration.component,
			controller: new OutputController<any>({
				metadata: metadata,
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
