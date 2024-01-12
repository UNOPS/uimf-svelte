<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	interface HTMLData {
		Value: string;
	}

	export let controller: OutputController<HTMLData>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value?.Value != null}
	<span class={controller.metadata.CustomProperties?.cssClass}>{@html controller.value.Value}</span>
{/if}

<style lang="scss">
	span.code-panel {
		display: block;
		padding: 20px 15px;
		clear: both;
		background: #f5f5f5;
		border-radius: 3px;
		border: 1px solid #e9e9e9;
	}

	.img-sm img {
		max-width: 100%;
		width: 250px;
	}
</style>
