<script lang="ts" context="module">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import FormLink, { type FormLinkData } from './FormLink.svelte';

	import type { ComponentMetadata } from '$lib/Infrastructure/uimf';

	export interface ActionListData {
		Actions: any[];
	}
	export class ActionListController extends OutputController<ActionListData> {}
</script>

<script lang="ts">
	import type { Controller } from '../Outputs/FormLink.svelte';
	export let controller: OutputController<ActionListData>;

	let component = new OutputComponent({
		refresh() {
			const value = controller.value;

			if (value != null) {
				for (let i = 0; i < value.Actions.length; i++) {
					// By default we want all buttons (even if they're just links) to have
					// the same styling.
					value.Actions[i].CssClass = value.Actions[i].CssClass ?? 'btn btn-default';
				}
			}

			controller.value = value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	const makeController = (value: FormLinkData) => {
		return new OutputController<FormLinkData>({
			metadata: {} as ComponentMetadata,
			data: value,
			form: controller.form!,
			app: controller.app
		}) as Controller;
	};
</script>

{#if controller.value?.Actions.length > 0}
	<div class="action-list">
		{#each controller.value.Actions as action}
			<div><FormLink controller={makeController(action)} /></div>
		{/each}
	</div>
{/if}

<style lang="scss">
	@import '../scss/styles.variables.scss';

	:global(td > *) > .action-list {
		padding: 3px 0px 3px 5px;
		margin: 0;
		background-color: transparent;
	}

	:global(.table > tbody > tr > td:has(> * > .action-list)) {
		padding: 0px;
		width: 1px;
		white-space: nowrap;
	}

	:global(.section > .form-group > div > div) > .action-list {
		margin: -10px -25px 0 -25px;
		padding: 5px 15px;
		background: transparent;
	}

	.action-list {
		background-color: $app-soft-bg;
		border-width: 0;
		padding: 5px 15px;
		text-align: right;
		margin-left: 0;
		margin-right: 0;
	}

	.action-list > span {
		display: inline-block;
		margin-right: 5px;
	}
</style>
