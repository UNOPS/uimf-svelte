<script lang="ts" context="module">
	export interface PopoverConfiguration {
		Visible: IComponent;
		Hidden: IComponent;
		VisiblePartCssClass: string | null;
		HiddenPartCssClass: string | null;
		Placement: string;
		Trigger: string;
		Interactive: boolean;
	}

	export interface PopoverData {
		Visible: any;
		Hidden: any;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
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

	let component = new OutputComponent({
		refresh() {
			if (controller.value == null) {
				visible = null;
				popoverOptions = null;
				hiddenContentDiv = null;
				return;
			}

			visible = controller.createNestedOutput(
				controller.metadata.Component.Configuration.Visible,
				controller.value.Visible
			);

			if (controller.value.Hidden != null) {
				// Create an in-memory div to render the hidden content
				hiddenContentDiv = document.createElement('div');
				hiddenContentDiv.className = controller.metadata.Component.Configuration?.HiddenPartCssClass ?? '';

				// Render the hidden output into the div
				controlRegister.createOutput(
					{
						props: {
							metadata: OutputFieldMetadataFactory.fromComponent(
								controller.metadata.Component.Configuration.Hidden
							),
							data: controller.value.Hidden,
							form: controller.form!,
							app: controller.app,
							parent: controller
						},
						wrap: { nolayout: true }
					},
					hiddenContentDiv
				);

				const config = controller.metadata.Component.Configuration;
				popoverOptions = {
					content: hiddenContentDiv,
					placement: config.Placement as any,
					trigger: config.Trigger,
					interactive: config.Interactive
				};
			} else {
				popoverOptions = null;
				hiddenContentDiv = null;
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));
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
