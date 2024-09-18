<!-- svelte-ignore a11y-label-has-associated-control -->
<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { InputController } from './Infrastructure/InputController';
	import { tooltip } from './Components/Tooltip.svelte';
	import { defaultControlRegister as controlRegister } from './Infrastructure/ControlRegister';
	import { InputComponent } from './Infrastructure/Component';
	import { FieldLayout } from './Infrastructure/uimf';

	export let controller: InputController<any>;
	export let nolayout: boolean = false;

	// Field constants.
	let component: ConstructorOfATypedSvelteComponent;
	let documentation: string | null = null;
	let hideIfNull: boolean;
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

			hideIfNull = controller.metadata.CustomProperties?.hideIfNull != null;

			component = componentRegistration.component;
			documentation = controller.metadata.CustomProperties?.documentation;

			// Prop "nolayout" takes precedence over the layout specified in the metadata.
			layout =
				nolayout || controller.metadata.Layout === FieldLayout.None
					? FieldLayout.None
					: controller.metadata.Layout ?? FieldLayout.Default;

			if (layout == FieldLayout.Default) {
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

{#if controller.value != null || !hideIfNull}
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
	{:else}
		<div class={controller.metadata.CssClass}>
			{#if !thisHideLabel}
				<label class="form-label" use:tooltip={documentation}>{controller.metadata.Label}:</label>
			{/if}
			<div class={layout == FieldLayout.Horizontal ? 'inline' : 'block'}>
				<svelte:component this={component} {controller} {required} />
			</div>
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
