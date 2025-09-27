<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
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
	<div class={controller.metadata.CssClass}>{@html controller.value.Value}</div>
{/if}

<style lang="scss">
	div {
		display: block;

		&.code-panel {
			display: block;
			padding: 20px 15px;
			clear: both;
			background: #f5f5f5;
			border-radius: 3px;
			border: 1px solid #e9e9e9;
		}

		:global(p) {
			margin-bottom: 5px;
			font-size: initial;
			line-height: initial;

			&:last-child {
				margin-bottom: 0;
			}
		}

		:global(ul:last-child) {
			margin-bottom: 0;
		}

		:global(li) {
			font-size: initial;
			line-height: initial;
			margin-bottom: 0;
			list-style-type: circle;
		}
	}

	.img-sm img {
		max-width: 100%;
		width: 250px;
	}
</style>
