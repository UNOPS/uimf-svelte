<!-- svelte-ignore a11y-label-has-associated-control -->
<script lang="ts">
	import { beforeUpdate, tick } from 'svelte';
	import type { OutputController } from './Infrastructure/OutputController';
	import { OutputComponent } from './Infrastructure/Component';
	import { tooltip } from './Components/Tooltip.svelte';
	import { defaultControlRegister as controlRegister } from './Infrastructure/ControlRegister';
	import { FieldLayout } from './Infrastructure/uimf';

	export let controller: OutputController<any>;
	export let nolayout: boolean = false;

	// Field constants.
	let component: ConstructorOfATypedSvelteComponent;
	let documentation: string | null = null;
	let hideIfNull: boolean;
	let thisHideLabel: boolean;
	let horizontalLayout: boolean = true;
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

			horizontalLayout =
				controller.metadata.Layout === FieldLayout.Default || controller.metadata.Layout == null
					? // If the layout is default, we use the component's config.
					  componentRegistration.config.displayAsBlock === false
					: // Otherwise, we use the layout specified for this particular field.
					  controller.metadata.Layout != FieldLayout.Vertical;

			documentation = controller.metadata.Documentation ?? null;

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
				<label use:tooltip={documentation}>{displayField.metadata.Label}</label>
			{/if}
			<div>
				<svelte:component this={component} {controller} />
			</div>
		</div>
	{:else if layout === FieldLayout.Horizontal || layout == FieldLayout.Vertical}
		<div
			class:output={true}
			class:row={horizontalLayout}
			class:column={!horizontalLayout}
			class={displayField.metadata.CssClass}
		>
			{#if !thisHideLabel}
				<label class:col-sm-2={horizontalLayout} use:tooltip={documentation}
					>{displayField.metadata.Label}</label
				>
			{/if}
			<div
				class:col-sm-10={horizontalLayout && !thisHideLabel}
				class:col-sm-12={horizontalLayout && thisHideLabel}
			>
				<svelte:component this={component} {controller} />
			</div>
		</div>
	{/if}
{/if}

<style lang="scss">
	.output {
		--horizontal-padding: 1.5rem;
		--vertical-padding: 15px;

		padding-left: var(--horizontal-padding);
		padding-right: var(--horizontal-padding);

		&.row {
			padding-bottom: var(--vertical-padding);

			& > label::after {
				content: ':';
			}
		}

		&.column {
			flex-direction: column;
			padding-bottom: 25px;
		}

		&.section {
			border-color: #ebeef0;
			border-style: solid;
			border-width: 20px 0 0 0;

			margin: 0 -15px;

			padding-left: 0;
			padding-right: 0;
			padding-top: var(--vertical-padding);
			padding-bottom: var(--vertical-padding);

			& > label {
				display: block;
				background-color: #f9f9f9;
				font-size: 1.8rem;

				margin-top: calc(var(--vertical-padding) * -1);
				margin-bottom: var(--vertical-padding);

				padding: 5px var(--horizontal-padding);
			}

			& > div {
				padding: 0 var(--horizontal-padding);
			}
		}
	}

	.long-label {
		padding: 0px;
	}

	:global(.output-section-heading) {
		font-size: 1.5em;
		margin: 0 0px 25px !important;
		display: block;
		background: #f4f5f7;
		padding: 10px 0px !important;

		& > a {
			color: white;
		}
	}

	:global(.custom-layout .output.section) {
		margin-left: -15px;
		margin-right: -15px;
	}
</style>
