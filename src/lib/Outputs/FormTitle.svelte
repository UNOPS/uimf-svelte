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
			title = controller.value?.Value ?? controller.form?.metadata?.Label ?? null;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if title != null && title.length > 0}
	{@html title}
{/if}

<style lang="scss">
</style>
