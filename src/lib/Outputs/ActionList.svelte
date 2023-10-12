<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import FormLink, { type FormLinkData, type FormLinkMetadata } from './FormLink.svelte';
	import type { Controller } from '../Outputs/FormLink.svelte';

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
			metadata: { disabled: false } as FormLinkMetadata,
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
	:global(td > div) > .action-list {
		padding: 3px 0px 3px 5px;
		margin: 0;
		background-color: transparent;
	}

	:global(.table > tbody > tr > td:has(> div > .action-list)) {
		padding: 0px;
		width: 1px;
	}

	.action-list {
		background-color: #f9f9f9;
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
