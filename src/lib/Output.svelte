<!-- svelte-ignore a11y-label-has-associated-control -->
<script lang="ts">
	import { beforeUpdate, tick } from 'svelte';
	import type { OutputController } from './Infrastructure/OutputController';
	import { OutputComponent } from './Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from './Infrastructure/ControlRegister';

	import { FieldLayout } from './Infrastructure/Metadata/FieldLayout';
	import FieldLabel from './Components/FieldLabel.svelte';

	export let controller: OutputController<any>;
	export let nolayout: boolean = false;

	// Field constants.
	let component: ConstructorOfATypedSvelteComponent;
	let hideIfNull: boolean;
	let thisHideLabel: boolean;
	let layout: FieldLayout = FieldLayout.Default;

	// The actual field that is currently being displayed.
	// We don't want to use `field` directly, because it
	// can cause issues where Svelte attempts to reuse existing
	// component for a completely different field (because Svelte
	// will aggressively try to reuse components). To avoid the
	// issue we will use `displayField` and set it to null before
	// re-rendering to avoid component reuse.
	let displayField: OutputController<any> | null = null;

	const componentController = new OutputComponent({
		async refresh() {
			const componentRegistration = controlRegister.outputs[controller.metadata.Component.Type];

			if (componentRegistration == null) {
				throw `Cannot find output for type '${controller.metadata.Component.Type}'.`;
			}

			component = componentRegistration.component;

			thisHideLabel =
				componentRegistration.config.alwaysHideLabel ||
				controller.metadata.Label === null ||
				controller.metadata.Label === '';

			hideIfNull = controller.metadata.HideIfNull;

			layout = nolayout ? FieldLayout.None : controller.metadata.Layout ?? FieldLayout.Default;

			if (layout === FieldLayout.Default) {
				layout = componentRegistration.config.displayAsBlock
					? FieldLayout.Vertical
					: FieldLayout.Horizontal;
			}

			controller = controller;

			const newField = controller;

			// Make field null first to avoid unexpected errors when Svelte
			// tries to bind new field to the old component. Not sure why
			// Svelte does this, but setting field to null and hiding the output
			// first forces Svelte kit to create a new component.
			displayField = null;

			// Wait for Svelte to remove old components.
			await tick();

			// Set the new field and let Svelte create new components.
			displayField = newField;
		}
	});

	beforeUpdate(async () => {
		if (controller != null) {
			await componentController.setup(controller);
		}
	});
</script>

{#if displayField != null && (displayField.value != null || !hideIfNull)}
	{#if displayField.metadata == null}
		<strong>null metadata</strong>
	{:else if layout === FieldLayout.None}
		{#if displayField.metadata.CssClass != null}
			<div class={displayField.metadata.CssClass}>
				<svelte:component this={component} {controller} />
			</div>
		{:else}
			<svelte:component this={component} {controller} />
		{/if}
	{:else if layout === FieldLayout.Unstyled}
		<div class={displayField.metadata.CssClass}>
			{#if !thisHideLabel}
				<FieldLabel
					label={displayField.metadata.Label}
					documentation={displayField.metadata.Documentation}
					documentationLayout={displayField.metadata.DocumentationLayout}
					fieldLayout={layout}
				/>
			{/if}
			<div>
				<svelte:component this={component} {controller} />
			</div>
		</div>
	{:else if layout === FieldLayout.Horizontal || layout == FieldLayout.Vertical}
		<div
			class:field={true}
			class:field-h={layout == FieldLayout.Horizontal}
			class:field-v={layout != FieldLayout.Horizontal}
			class={displayField.metadata.CssClass}
		>
			{#if !thisHideLabel}
				<FieldLabel
					label={displayField.metadata.Label}
					documentation={displayField.metadata.Documentation}
					documentationLayout={displayField.metadata.DocumentationLayout}
					fieldLayout={layout}
				/>
			{/if}
			<div>
				<svelte:component this={component} {controller} />
			</div>
		</div>
	{/if}
{/if}

<style lang="scss">
	.long-label {
		padding: 0px;
	}
</style>
