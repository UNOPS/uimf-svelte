<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import type { ComponentMetadata } from '../Infrastructure/uimf';
	import Output from '../Output.svelte';

	interface ExpandableData {
		ShowButton: boolean;
		Visible: any;
		Hidden: any;
		handler: (show: boolean) => void | null;
		show: (show: boolean) => void;
	}

	interface ExpandableMetadata extends ComponentMetadata {
		CustomProperties: {
			ItemTypes: ComponentMetadata[];
		};
	}

	class ExpandableController extends OutputController<ExpandableData, ExpandableMetadata> {
	}

	export let controller: ExpandableController;

	let showHidden: boolean = false;
	let shown: boolean = false;
	let visible: OutputController<any> | null = null;
	let hidden: OutputController<any> | null = null;

	let component = new OutputComponent({
		refresh() {
			if (controller.value == null) {
				visible = null;
				hidden = null;
				shown = false;
				showHidden = false;
				return;
			}

			controller.value = controller.value;
			controller.value.show = toggle;

			visible = new OutputController<any>({
				metadata: controller.metadata.CustomProperties.ItemTypes[0],
				data: controller.value.Visible,
				form: controller.form!,
				app: controller.app
			});

			hidden = new OutputController<any>({
				metadata: controller.metadata.CustomProperties.ItemTypes[1],
				data: controller.value.Hidden,
				form: controller.form!,
				app: controller.app
			});
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function toggle(show: boolean) {
		if (show == showHidden) {
			return;
		}

		if (controller.value?.handler != null) {
			controller.value.handler(show);
		} else {
			shown = shown || show;
		}

		showHidden = show;
	}
</script>

{#if visible != null}
	<div class="expandable-visible">
		<Output controller={visible} hideLabel={true} />

		{#if hidden != null}
			<button
				on:click={() => toggle(!showHidden)}
				on:keypress={() => toggle(!showHidden)}
				type="button"
			>
				<i
					class="fa"
					class:fa-chevron-circle-right={!showHidden}
					class:fa-chevron-circle-down={showHidden}
				/>
			</button>
		{/if}
	</div>
{/if}

{#if hidden != null}
	{#if showHidden || shown}
		{#if shown}
			<div class:hide={!showHidden} class="expandable-hidden">
				<Output controller={hidden} hideLabel={true} />
			</div>
		{/if}
	{/if}
{/if}

<style lang="scss">
	.expandable-visible {
		display: flex;
		align-items: center;
	}

	.hide {
		display: none;
	}

	.expandable-hidden {
		margin: 10px 0 0 0;
	}

	button {
		border: none;
		outline: none;
		background: transparent;
		margin: 0 0 0 8px;
		padding: 0;
		opacity: 0.8;
	}
</style>
