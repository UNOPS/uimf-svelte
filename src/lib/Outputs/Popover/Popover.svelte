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
	import Output from '../../Output.svelte';
	import { popover, type PopoverOptions } from '../../Components/Popover.svelte';

	class PopoverController extends OutputController<
		PopoverData,
		IOutputFieldMetadata<PopoverConfiguration>
	> {}

	export let controller: PopoverController;

	let visible: OutputController<any> | null = null;
	let hidden: OutputController<any> | null = null;
	let hiddenElement: HTMLElement | null = null;
	let popoverOptions: PopoverOptions | null = null;
	let hiddenElementId: string | null = null;

	let component = new OutputComponent({
		refresh() {
			if (controller.value == null) {
				visible = null;
				hidden = null;
				popoverOptions = null;
				return;
			}

			visible = controller.createNestedOutput(
				controller.metadata.Component.Configuration.Visible,
				controller.value.Visible
			);

			if (controller.value.Hidden != null) {
				hidden = controller.createNestedOutput(
					controller.metadata.Component.Configuration.Hidden,
					controller.value.Hidden
				);

				// Generate unique ID for the hidden element
				hiddenElementId = `popover-hidden-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

				const config = controller.metadata.Component.Configuration;
				popoverOptions = {
					content: () => {
						const element = document.getElementById(hiddenElementId!);
						if (element) {
							element.style.display = 'block';
							element.style.position = 'static';
							element.style.visibility = 'visible';
						}
						return element!;
					},
					placement: config.Placement as any,
					trigger: config.Trigger,
					interactive: config.Interactive
				};
			} else {
				hidden = null;
				hiddenElementId = null;
				popoverOptions = null;
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

{#if hidden != null && hiddenElementId != null}
	<div
		id={hiddenElementId}
		bind:this={hiddenElement}
		class:popover-content={true}
		class={controller.metadata.Component.Configuration?.HiddenPartCssClass}
	>
		<Output controller={hidden} nolayout={true} />
	</div>
{/if}

<style lang="scss">
	.popover-trigger {
		cursor: pointer;
		display: inline-flex;
		align-items: center;
	}

	.popover-content {
		/* Hidden by default, tippy will set display: block when showing */
		display: none;
	}
</style>
