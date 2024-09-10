<!-- svelte-ignore a11y-label-has-associated-control -->
<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { InputController } from './Infrastructure/InputController';
	import { tooltip } from './Components/Tooltip.svelte';
	import { defaultControlRegister as controlRegister } from './Infrastructure/ControlRegister';
	import { InputComponent } from './Infrastructure/Component';

	export let controller: InputController<any>;
	export let hideLabel: boolean = false;

	// Field constants.
	let component: ConstructorOfATypedSvelteComponent;
	let documentation: string | null = null;
	let defaultCssClass: string;
	let hideIfNull: boolean;
	let thisHideLabel: boolean;
	let required: boolean;

	const componentController = new InputComponent({
		init() {
			const componentRegistration = controlRegister.inputs[controller.metadata.Component.Type];

			if (componentRegistration == null) {
				throw `Cannot find input for type '${controller.metadata.Component.Type}'.`;
			}

			thisHideLabel =
				hideLabel ||
				componentRegistration.config.alwaysHideLabel ||
				controller.metadata.Label === null ||
				controller.metadata.Label === '';

			hideIfNull = controller.metadata.CustomProperties?.hideIfNull != null;

			component = componentRegistration.component;

			defaultCssClass = componentRegistration.config.displayAsBlock ? 'block' : 'inline';
			documentation = controller.metadata.CustomProperties?.documentation;

			required = controller.metadata.Required;

			controller.ready?.resolve();
		},
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => {
		await componentController.setup(controller);
	});
</script>

{#if controller.value != null || !hideIfNull}
	{#if thisHideLabel}
		<div class={defaultCssClass}>
			<svelte:component this={component} {controller} {required} />
		</div>
	{:else if controller.metadata == null}
		<strong>null metadata</strong>
	{:else}
		<label class="form-label" use:tooltip={documentation}>{controller.metadata.Label}:</label>
		<div class={defaultCssClass}>
			<svelte:component this={component} {controller} {required} />
		</div>
	{/if}
{/if}

<style lang="scss">
	.block {
		display: block;
	}

	.inline {
		display: inline;
	}
</style>
