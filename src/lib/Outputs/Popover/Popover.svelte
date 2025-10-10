<script lang="ts" context="module">
	export interface PopoverConfiguration {
		Visible: IComponent;
		Hidden: IComponent;
		VisiblePartCssClass: string | null;
		HiddenPartCssClass: string | null;
		Placement: string;
		Trigger: string;
		Interactive: boolean;
		MaxWidth: string | null;
		MaxHeight: string | null;
	}

	export interface PopoverData {
		Visible: any;
		Hidden: any;
	}
</script>

<script lang="ts">
	import { beforeUpdate, onDestroy } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import type { IComponent, IOutputFieldMetadata } from '../../Infrastructure/Metadata';
	import { OutputFieldMetadataFactory } from '../../Infrastructure/Utilities/OutputFieldMetadataFactory';
	import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
	import Output from '../../Output.svelte';
	import { popover, type PopoverOptions } from '../../Components/Popover.svelte';

	class PopoverController extends OutputController<
		PopoverData,
		IOutputFieldMetadata<PopoverConfiguration>
	> {}

	export let controller: PopoverController;

	let visible: OutputController<any> | null = null;
	let popoverOptions: PopoverOptions | null = null;
	let hiddenContentDiv: HTMLElement | null = null;
	let hiddenSvelteComponent: any = null;

	let component = new OutputComponent({
		refresh() {
			if (controller.value == null) {
				visible = null;
				popoverOptions = null;
				hiddenContentDiv = null;

				// Destroy the old hidden component if it exists
				if (hiddenSvelteComponent) {
					hiddenSvelteComponent.$destroy();
					hiddenSvelteComponent = null;
				}
				return;
			}

			visible = controller.createNestedOutput(
				controller.metadata.Component.Configuration.Visible,
				controller.value.Visible
			);

			if (controller.value.Hidden != null) {
				// Destroy the old hidden component before creating a new one
				if (hiddenSvelteComponent) {
					hiddenSvelteComponent.$destroy();
					hiddenSvelteComponent = null;
				}

				// Create an in-memory div to render the hidden content
				const config = controller.metadata.Component.Configuration;
				hiddenContentDiv = document.createElement('div');
				hiddenContentDiv.className = config?.HiddenPartCssClass ?? '';

				// Apply max-height and overflow for scrolling
				if (config?.MaxHeight) {
					hiddenContentDiv.style.maxHeight = config.MaxHeight;
					hiddenContentDiv.style.overflowY = 'auto';
				}

				// Render the hidden output into the div and store the component instance
				const result = controlRegister.createOutput(
					{
						props: {
							metadata: OutputFieldMetadataFactory.fromComponent(config.Hidden),
							data: controller.value.Hidden,
							form: controller.form!,
							app: controller.app,
							parent: controller
						},
						wrap: { nolayout: true }
					},
					hiddenContentDiv
				);

				hiddenSvelteComponent = result.component;

				popoverOptions = {
					content: hiddenContentDiv,
					placement: config.Placement as any,
					trigger: config.Trigger,
					interactive: config.Interactive,
					maxWidth: config.MaxWidth
				};
			} else {
				popoverOptions = null;
				hiddenContentDiv = null;

				// Destroy the old hidden component if it exists
				if (hiddenSvelteComponent) {
					hiddenSvelteComponent.$destroy();
					hiddenSvelteComponent = null;
				}
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	onDestroy(() => {
		if (hiddenSvelteComponent) {
			hiddenSvelteComponent.$destroy();
			hiddenSvelteComponent = null;
		}
	});
</script>

{#if visible != null}
	{#if popoverOptions != null}
		<span
			use:popover={popoverOptions}
			class:popover-trigger={true}
			class={controller.metadata.Component.Configuration?.VisiblePartCssClass}
		>
			<Output controller={visible} nolayout={true} />
		</span>
	{:else}
		<span class={controller.metadata.Component.Configuration?.VisiblePartCssClass}>
			<Output controller={visible} nolayout={true} />
		</span>
	{/if}
{/if}

<style lang="scss">
	.popover-trigger {
		cursor: pointer;
		display: inline-flex;
		align-items: center;
	}
</style>
