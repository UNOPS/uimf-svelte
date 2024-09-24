<script lang="ts" context="module">
	export interface ExpandableConfiguration {
		Visible: IComponent;
		Hidden: IComponent;
		VisiblePartCssClass: string | null;
		HiddenPartCssClass: string | null;
	}

	export interface ExpandableData {
		ShowButton: boolean;
		Visible: any;
		Hidden: any;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import type { IFieldMetadata, IComponent } from '../Infrastructure/uimf';
	import Output from '../Output.svelte';

	interface ExpandableItem extends ExpandableData {
		handler: (show: boolean) => void | null;
		show: (show: boolean) => void;
	}

	class ExpandableController extends OutputController<
		ExpandableItem,
		IFieldMetadata<ExpandableConfiguration>
	> {}

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
				metadata: {
					Component: controller.metadata.Component.Configuration.Visible,
					Hidden: false,
					Id: Date.now().toString(),
					Label: '',
					OrderIndex: 0
				},
				data: controller.value.Visible,
				form: controller.form!,
				app: controller.app
			});

			if (controller.value.Hidden != null) {
				hidden = new OutputController<any>({
					metadata: {
						Component: controller.metadata.Component.Configuration.Hidden,
						Hidden: false,
						Id: Date.now().toString(),
						Label: '',
						OrderIndex: 0
					},
					data: controller.value.Hidden,
					form: controller.form!,
					app: controller.app
				});
			} else {
				hidden = null;
			}
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
	<div
		class:expandable-visible={true}
		class={controller.metadata.Component.Configuration?.VisiblePartCssClass}
	>
		<Output controller={visible} nolayout={true} />

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
			<div
				class:hide={!showHidden}
				class:expandable-hidden={true}
				class={controller.metadata.Component.Configuration?.HiddenPartCssClass}
			>
				<Output controller={hidden} nolayout={true} />
			</div>
		{/if}
	{/if}
{/if}

<style lang="scss">
	.expandable-visible {
		display: inline-flex;
		align-items: center;
	}

	.expandable-visible > i {
		display: inline-block;
		margin: 4px 0 0 4px;
		opacity: 0.8;
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
