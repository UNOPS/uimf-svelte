<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';

	interface IData {
		Value: string | null;
	}

	interface IConfiguration {
		CssClass: string | null;
	}

	export let controller: OutputController<IData>;

	let documentation: string | null = null;

	let component = new OutputComponent({
		refresh() {
			documentation = controller.value?.Value ?? controller.form?.metadata?.Documentation ?? null;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if documentation != null && documentation.length > 0}
	<div class={controller.metadata.Component.Configuration?.CssClass}>
		<div class="form-doc">
			{@html documentation}
		</div>
	</div>
{/if}

<style lang="scss">
	.form-doc {
		background: #e2f6ff;
		border: 1px solid #cbe1e8;
		border-radius: 2px;
		color: #1b4350;
		padding: 15px;
	}

	:global(.form-doc > p:last-child) {
		margin-bottom: 0;
	}
</style>
