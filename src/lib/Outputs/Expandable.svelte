<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import type { ComponentMetadata } from '..//Infrastructure/uimf';
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

	let showHidden = false;
	let buttonCssClass = 'fa fa-chevron-circle-right';
	let visible = true;

	let mainController: OutputController<any> | null = null;

	let expandableController: OutputController<any> | null = null;

	let component = new OutputComponentController({
		refresh() {
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

	const baseToggle = (isButton: boolean) => {
		let customToggle = (controller.value || {}).toggle;

		if (!isButton && controller.value?.ShowButton) {
			return;
		}

		showHidden = !showHidden;

		if (customToggle != null) {
			customToggle();
		} else {
			showHidden = showHidden;
		}

		render(showHidden);
	};

	const render = (show: boolean) => {
		showHidden = show;
		buttonCssClass = show ? 'fa fa-chevron-circle-down' : 'fa fa-chevron-circle-right';
	};

	beforeUpdate(async () => await component.setup(controller));
</script>

<div class="expandable-visible">
	{#if visible && mainController != null}
		<div
			on:click={() => {
				baseToggle(false);
			}}
			on:keydown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					baseToggle(false);
				}
			}}
			class="pointer"
			role="button"
			tabindex="0"
			aria-label="Expandable Content"
		>
			<Output controller={mainController} hideLabel={true} />
		</div>
	{/if}

	{#if controller.value?.ShowButton}
		<i
			class={buttonCssClass}
			on:click={() => {
				baseToggle(true);
			}}
			on:keydown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					baseToggle(true);
				}
			}}
			role="button"
			tabindex="0"
			aria-label="Toggle Expandable"
		/>
	{/if}
</div>

{#if visible && showHidden && expandableController != null}
	<Output controller={expandableController} hideLabel={true} />
{/if}
