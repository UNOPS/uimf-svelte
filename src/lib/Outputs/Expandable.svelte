<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import type { ComponentMetadata } from '../Infrastructure/uimf';
	import Output from '../Output.svelte';

	interface ExpandableData {
		ShowButton: boolean;
		toggle: () => any;
		Visible: any;
		Hidden: any;
	}

	interface ExpandableMetadata extends ComponentMetadata {
		CustomProperties: {
			ItemTypes: ComponentMetadata[];
		};
	}

	class ExpandableController extends OutputController<ExpandableData> {
		declare metadata: ExpandableMetadata;
	}

	export let controller: ExpandableController;

	let showHidden: boolean = false;
	let shown: boolean = false;
	let handler = defaultHandler;

	let mainController: OutputController<any> | null = null;

	let expandableController: OutputController<any> | null = null;

	let component = new OutputComponent({
		refresh() {
			if (controller.value == null) {
				mainController = null;
				expandableController = null;
				shown = false;
				showHidden = false;
				handler = defaultHandler;
				return;
			}

			controller.value = controller.value;
			if (controller.value != null) {
				mainController = new OutputController<any>({
					metadata: controller.metadata.CustomProperties.ItemTypes[0],
					data: controller.value.Visible,
					form: controller.form!,
					app: controller.app
				});

				expandableController = new OutputController<any>({
					metadata: controller.metadata.CustomProperties.ItemTypes[1],
					data: controller.value.Hidden,
					form: controller.form!,
					app: controller.app
				});
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function defaultHandler(show: boolean) {
		// Mark as shown.
		shown = shown || show;
	}

	function toggle(show: boolean) {
		if (show == showHidden) {
			return;
		}

		handler(show);

		showHidden = show;
	}
</script>

{#if mainController != null}
	<Output controller={mainController} hideLabel={true} />
{/if}

{#if expandableController != null}
	{#if showHidden || shown}
		<i
			class="fa fa-chevron-circle-right"
			class:fa-chevron-circle-down={!showHidden}
			class:fa-chevron-circle-up={showHidden}
			on:click={() => toggle(!showHidden)}
			on:keypress={() => toggle(!showHidden)}
		/>

		{#if shown}
			<div class:hide={!showHidden}>
				<Output controller={expandableController} hideLabel={true} />
			</div>
		{/if}
	{:else}
		<i
			class="fa fa-chevron-circle-down"
			on:click={() => toggle(true)}
			on:keypress={() => toggle(true)}
		/>
	{/if}
{/if}

<style lang="scss">
	.hide {
		display: none;
	}
</style>
