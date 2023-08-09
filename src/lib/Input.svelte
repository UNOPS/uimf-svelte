<!-- svelte-ignore a11y-label-has-associated-control -->
<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { InputController } from './Infrastructure/InputController';
	import { tooltip } from './Components/Tooltip.svelte';
	import { defaultControlRegister as controlRegister } from './Infrastructure/ControlRegister';
	import { InputComponentController } from './Infrastructure/ComponentController';

	export let controller: InputController<any>;
	export let hideLabel: boolean = false;
	export let contentTooltip: string | null = null;
	export let contentCssClass: string | null = null;

	// Field constants.
	let component: ConstructorOfATypedSvelteComponent;
	let documentation: string | null = null;
	let defaultCssClass: string;
	let hideIfNull: boolean;
	let thisHideLabel: boolean;

	const componentController = new InputComponentController({
		init() {
			const componentRegistration = controlRegister.inputs[controller.metadata.Type];

			if (componentRegistration == null) {
				throw `Cannot find input for type '${controller.metadata.Type}'.`;
			}

			thisHideLabel =
				hideLabel ||
				componentRegistration.config.alwaysHideLabel ||
				controller.metadata.Label === null ||
				controller.metadata.Label === '';

			hideIfNull = controller.metadata.CustomProperties?.hideIfNull != null;

			component = componentRegistration.component;

			defaultCssClass = componentRegistration.config.displayAsBlock ? 'block' : 'inline';
			documentation = controller.metadata.CustomProperties?.Documentation;

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
		<div class={contentCssClass || defaultCssClass} use:tooltip={contentTooltip}>
			<svelte:component this={component} {controller} />
		</div>
	{:else if controller.metadata == null}
		<strong>null metadata</strong>
	{:else}
		<label class="form-label" use:tooltip={documentation}>{controller.metadata.Label}:</label>
		<div class={contentCssClass || defaultCssClass} use:tooltip={contentTooltip}>
			<svelte:component this={component} {controller} />
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
