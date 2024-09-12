<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';

	interface IData {
		Value: string | null;
	}

	export let controller: OutputController<IData>;

	let title: string | null = null;

	let component = new OutputComponent({
		refresh() {
			title = controller.value?.Value ?? controller.form?.metadata?.CustomProperties?.documentation;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if title != null && title.length > 0}
	<div class="wrapper">
		<div class="inner">
			{@html title}
		</div>
	</div>
{/if}

<style lang="scss">
	.wrapper {
		padding: 15px 15px;
	}

	.inner {
		background: #e2f6ff;
		border: 1px solid #cbe1e8;
		border-radius: 2px;
		color: #1b4350;
		padding: 15px;
	}

	:global(.wrapper.inner > p:last-child) {
		margin-bottom: 0;
	}
</style>
