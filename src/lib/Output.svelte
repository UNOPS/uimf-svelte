<!-- svelte-ignore a11y-label-has-associated-control -->
<script lang="ts">
	import { beforeUpdate, tick } from 'svelte';
	import type { OutputController } from './Infrastructure/OutputController';
	import { OutputComponent } from './Infrastructure/Component';
	import { tooltip } from './Components/Tooltip.svelte';
	import { defaultControlRegister as controlRegister } from './Infrastructure/ControlRegister';

	import { FieldLayout } from './Infrastructure/Metadata/FieldLayout';

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
			class:output-h={horizontalLayout}
			class:output-v={!horizontalLayout}
			class={displayField.metadata.CssClass}
		>
			{#if !thisHideLabel}
				<label use:tooltip={documentation}>{displayField.metadata.Label}</label>
			{/if}
			<div>
				<svelte:component this={component} {controller} />
			</div>
		</div>
	{/if}
{/if}

<style lang="scss">
	// Import Bootstrap functions and variables for media queries
	@import 'bootstrap/scss/functions';
	@import 'bootstrap/scss/variables';
	@import 'bootstrap/scss/mixins';

	.output {
		--horizontal-padding: 1.5rem;
		--vertical-padding: 15px;

		display: flex;

		// padding-left: var(--horizontal-padding);
		// padding-right: var(--horizontal-padding);

		&.output-h {
			flex-direction: row;

			& > label {
				flex-shrink: 0;
				min-width: 0;
				padding-right: 10px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;

				// Default (mobile first - xs)
				flex-basis: 100px;

				// Bootstrap responsive breakpoints using mixins
				@include media-breakpoint-up(sm) {
					flex-basis: 120px;
				}

				@include media-breakpoint-up(md) {
					flex-basis: 150px;
				}

				@include media-breakpoint-up(lg) {
					flex-basis: 180px;
				}

				@include media-breakpoint-up(xl) {
					flex-basis: 200px;
				}

				@include media-breakpoint-up(xxl) {
					flex-basis: 220px;
				}

				&::after {
					content: ':';
				}
			}

			& > div {
				flex-grow: 1;
				min-width: 0;
			}
		}

		&.output-v {
			flex-direction: column;
		}

		label {
			margin: 0;
		}

		&.section {
			border-color: #ebeef0;
			border-style: solid;
			border-width: 20px 0 0 0;

			&.output-h {
				margin: 0;
			}

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

				padding: 0 var(--horizontal-padding);
				width: 100%;
			}

			& > div {
				padding: 0 var(--horizontal-padding);
			}
		}
	}

	.long-label {
		padding: 0px;
	}
</style>
