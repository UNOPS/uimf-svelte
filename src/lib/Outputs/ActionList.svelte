<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import FormLink, { type FormLinkData, type FormLinkMetadata } from './FormLink.svelte';
	import type { Controller } from '../Outputs/FormLink.svelte';

	interface ActionListData {
		Actions: any[];
	}

	export let controller: OutputController<ActionListData>;

	let component = new OutputComponentController({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	const makeController = (value: FormLinkData) => {
		return new OutputController<FormLinkData>(
			{
				metadata: { disabled: false } as FormLinkMetadata,
				data: value,
				form: controller.form!,
				app: controller.app
			}
		) as Controller;
	};
</script>

{#if controller.value?.Actions.length > 0}
	<div class="action-list">
		{#each controller.value.Actions as action}
			<span><FormLink controller={makeController(action)} /></span>
		{/each}
	</div>
{/if}

<style lang="scss">
	.action-list {
		background-color: white;
		border-width: 0;
		margin: -10px -20px 15px;
		padding: 5px 15px;
		text-align: right;
	}

	.action-list > span {
		display: inline-block;
		margin-right: 5px;
	}
</style>
