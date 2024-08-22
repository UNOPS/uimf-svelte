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
	let hideIfNull: boolean;
	let thisHideLabel: boolean;
	let horizontalLayout: boolean = true;

	const componentController = new OutputComponent({
		refresh() {
			const componentRegistration = controlRegister.outputs[controller.metadata.Component.Type];

			if (componentRegistration == null) {
				throw `Cannot find output for type '${controller.metadata.Component.Type}'.`;
			}

			component = componentRegistration.component;

			thisHideLabel =
				hideLabel ||
				componentRegistration.config.alwaysHideLabel ||
				controller.metadata.Label === null ||
				controller.metadata.Label === '';

			hideIfNull = controller.metadata.CustomProperties?.hideIfNull != null;

			horizontalLayout =
				controller.metadata.Layout === 'default'
					? // If the layout is default, we use the component's config.
					  componentRegistration.config.displayAsBlock === false
					: // Otherwise, we use the layout specified for this particular field.
					  controller.metadata.Layout != 'vertical';

			// Always use column layout if the label is hidden. This makes
			// the content span the full width of the container.
			horizontalLayout = horizontalLayout && !thisHideLabel;

			documentation = controller.metadata.CustomProperties?.documentation;

			controller = controller;
		}
	});

	beforeUpdate(async () => {
		await componentController.setup(controller);
	});
</script>

{#if controller.value != null || !hideIfNull}
	{#if controller.metadata == null}
		<strong>null metadata</strong>
	{:else}
		<div class:wrapper={true} class={horizontalLayout ? 'row' : 'column'}>
			{#if !thisHideLabel}
				<label
					class={controller.metadata.CustomProperties?.cssClassLabel ?? ''}
					class:col-sm-2={horizontalLayout}
					use:tooltip={documentation}>{controller.metadata.Label}:</label
				>
			{/if}
			<div
				class="{contentCssClass ?? ''} {controller.metadata.CustomProperties?.cssClassLabel ?? ''}"
				class:col-sm-10={horizontalLayout}
				use:tooltip={contentTooltip}
			>
				<svelte:component this={component} {controller} />
			</div>
		</div>
	{/if}
{/if}

<style lang="scss">
	.wrapper {
		--padding-left: 15px;

		& > label {
			padding-left: var(--padding-left);
		}

		&.row {
			margin-left: 0 !important;
			margin-right: 0 !important;

			& > div {
				display: inline;
			}
		}

		&.column {
			flex-direction: column;
			margin-bottom: 25px;

			& > div {
				display: block;
				padding-left: var(--padding-left);
			}
		}
	}

	.long-label {
		padding: 0px;
	}

	:global(.output-section-heading) {
		font-size: 1.5em;
		margin: 20px 0 10px;
		display: block;
		background: #8d93a2;
		color: white;
		padding: 5px 15px;

		& > a {
			color: white;
		}
	}
</style>
