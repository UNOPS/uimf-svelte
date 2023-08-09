<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';

	export let controller: OutputController<string>;

	let component = new OutputComponentController({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	{controller.value}
{/if}
