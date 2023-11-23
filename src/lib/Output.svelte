<!-- svelte-ignore a11y-label-has-associated-control -->
<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from './Infrastructure/OutputController';
	import { OutputComponent } from './Infrastructure/Component';
	import { tooltip } from './Components/Tooltip.svelte';
	import { defaultControlRegister as controlRegister } from './Infrastructure/ControlRegister';

	export let controller: OutputController<any>;
	export let hideLabel: boolean = false;
	export let contentTooltip: string | null = null;
	export let contentCssClass: string | null = null;

	// Field constants.
	let component: ConstructorOfATypedSvelteComponent;
	let documentation: any;
	let defaultCssClass: string;
	let hideIfNull: boolean;
	let thisHideLabel: boolean;

	const componentController = new OutputComponent({
		refresh() {
			const componentRegistration = controlRegister.outputs[controller.metadata.Type];

			if (componentRegistration == null) {
				throw `Cannot find output for type '${controller.metadata.Type}'.`;
			}

			component = componentRegistration.component;

			thisHideLabel =
				hideLabel ||
				componentRegistration.config.alwaysHideLabel ||
				controller.metadata.Label === null ||
				controller.metadata.Label === '';

			hideIfNull = controller.metadata.CustomProperties?.hideIfNull != null;

			defaultCssClass = componentRegistration.config.displayAsBlock ? 'block' : 'inline';
			documentation = controller.metadata.CustomProperties?.Documentation;

			controller = controller;
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
		<div class="row mb-3">
			<label class="col-sm-2 col-form-label" use:tooltip={documentation}
				>{controller.metadata.Label}:</label
			>
			<div class={`${contentCssClass || defaultCssClass} col-sm-10`} use:tooltip={contentTooltip}>
				<svelte:component this={component} {controller} />
			</div>
		</div>
	{/if}
{/if}

<style lang="scss">
	.col-sm-10 {
		padding-top: calc(0.375rem + 1px);
	}

	.block {
		display: block;
	}

	.inline {
		display: inline;
	}
</style>
