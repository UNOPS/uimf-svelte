<!-- svelte-ignore a11y-label-has-associated-control -->
<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { InputController } from './Infrastructure/InputController';
	import { tooltip } from './Components/Tooltip.svelte';
	import { defaultControlRegister as controlRegister } from './Infrastructure/ControlRegister';
	import { InputComponent } from './Infrastructure/Component';
	import { DocumentationLayout, FieldLayout } from './Infrastructure/uimf';
	
	export let controller: InputController<any>;
	export let nolayout: boolean = false;

	// Field constants.
	let component: ConstructorOfATypedSvelteComponent;
	let documentation: string | null = null;
	let thisHideLabel: boolean;
	let required: boolean;
	let layout: FieldLayout;
	let documentationLayout: DocumentationLayout | null;

	const componentController = new InputComponent({
		init() {
			const componentRegistration = controlRegister.inputs[controller.metadata.Component.Type];

			if (componentRegistration == null) {
				throw `Cannot find input for type '${controller.metadata.Component.Type}'.`;
			}

			thisHideLabel =
				componentRegistration.config.alwaysHideLabel ||
				controller.metadata.Label === null ||
				controller.metadata.Label === '';

			component = componentRegistration.component;
			documentation = controller.metadata.Documentation ?? null;
			documentationLayout = controller.metadata.DocumentationLayout ?? DocumentationLayout.Default;

			layout = nolayout ? FieldLayout.None : controller.metadata.Layout ?? FieldLayout.Default;

			if (layout === FieldLayout.Default) {
				layout = componentRegistration.config.displayAsBlock
					? FieldLayout.Vertical
					: FieldLayout.Horizontal;
			}

			required = controller.metadata.Required;
		},
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => {
		await componentController.setup(controller);
	});
</script>

{#if controller.metadata == null}
	<strong>null metadata</strong>
{:else if layout === FieldLayout.None}
	{#if controller.metadata.CssClass != null}
		<div class={controller.metadata.CssClass}>
			<svelte:component this={component} {controller} {required} />
		</div>
	{:else}
		<svelte:component this={component} {controller} {required} />
	{/if}
{:else if layout === FieldLayout.Unstyled}
	<div class={controller.metadata.CssClass}>
		{#if !thisHideLabel}
			{#if documentationLayout == DocumentationLayout.Icon}
				<label>{controller.metadata.Label}</label>
				<span use:tooltip={documentation}><i class="fa-solid fa-circle-info text-info" /></span>
			{:else}
				<label use:tooltip={documentation}>{controller.metadata.Label}</label>
			{/if}
		{/if}
		<div>
			<svelte:component this={component} {controller} />
		</div>
	</div>
{:else if layout === FieldLayout.Horizontal || layout == FieldLayout.Vertical}
	<div
		class={controller.metadata.CssClass}
		class:row={layout == FieldLayout.Horizontal}
		class:column={layout == FieldLayout.Vertical}
	>
		{#if !thisHideLabel}
			{#if documentationLayout == DocumentationLayout.Icon}
				<label
					class="form-label"
					class:col-sm-4={layout == FieldLayout.Horizontal}>{controller.metadata.Label}:</label
				><span use:tooltip={documentation}><i class="fa-solid fa-circle-info text-info" /></span>
			{:else}
				<label
					class="form-label"
					class:col-sm-4={layout == FieldLayout.Horizontal}
					use:tooltip={documentation}>{controller.metadata.Label}:</label
				>
			{/if}
		{/if}
		<div
			class:col-sm-8={layout == FieldLayout.Horizontal && !thisHideLabel}
			class:col-sm-12={layout == FieldLayout.Horizontal && thisHideLabel}
		>
			<svelte:component this={component} {controller} {required} />
		</div>
	</div>
{/if}

<style lang="scss">
	.section {
		--horizontal-padding: 25px;
		--vertical-padding: 15px;

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
</style>
