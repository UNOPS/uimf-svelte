<!-- svelte-ignore a11y-label-has-associated-control -->
<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { InputController } from './Infrastructure/InputController';
	import { defaultControlRegister as controlRegister } from './Infrastructure/ControlRegister';
	import { InputComponent } from './Infrastructure/Component';
	import FieldLabel from './Components/FieldLabel.svelte';

	import { FieldLayout } from './Infrastructure/Metadata/FieldLayout';
	import { DocumentationLayout } from './Infrastructure/Metadata/DocumentationLayout';

	export let controller: InputController<any>;
	export let nolayout: boolean = false;

	// Field constants.
	let component: ConstructorOfATypedSvelteComponent;
	let thisHideLabel: boolean;
	let required: boolean;
	let layout: FieldLayout;

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
		<div class={controller.metadata.CssClass} class:component={true}>
			<svelte:component this={component} {controller} {required} />
		</div>
	{:else}
		<svelte:component this={component} {controller} {required} />
	{/if}
{:else if layout === FieldLayout.Unstyled}
	<div class={controller.metadata.CssClass}>
		{#if !thisHideLabel}
			<FieldLabel
				label={controller.metadata.Label}
				documentation={controller.metadata.Documentation ?? null}
				documentationLayout={controller.metadata.DocumentationLayout ?? null}
				fieldLayout={layout}
			/>
		{/if}
		<div class:component={true}>
			<svelte:component this={component} {controller} />
		</div>
	</div>
{:else if layout === FieldLayout.Horizontal || layout == FieldLayout.Vertical}
	<div
		class:field={true}
		class:field-h={layout == FieldLayout.Horizontal}
		class:field-v={layout != FieldLayout.Horizontal}
		class={controller.metadata.CssClass}
	>
		{#if !thisHideLabel}
			<FieldLabel
				label={controller.metadata.Label}
				documentation={controller.metadata.Documentation ?? null}
				documentationLayout={controller.metadata.DocumentationLayout ?? null}
				fieldLayout={layout}
			/>
		{/if}
		<div class:component={true}>
			<svelte:component this={component} {controller} {required} />
		</div>
	</div>
{/if}
