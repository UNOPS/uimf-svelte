<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import FormLink, { type FormLinkData } from './FormLink.svelte';
	import type { Controller } from '../Outputs/FormLink.svelte';
	import type { ComponentMetadata } from '$lib/Infrastructure/uimf';

	interface ActionListData {
		Actions: any[];
	}

	export let controller: OutputController<ActionListData>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
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
	<div class="action-list 123">
		{#each controller.value.Actions as action}
			<div><FormLink controller={makeController(action)} /></div>
		{/each}
	</div>
{/if}

<style lang="scss">
	@import '../../scss/styles.variables.scss';

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

	:global(.section) .action-list {
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
