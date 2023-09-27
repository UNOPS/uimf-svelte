<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import { tooltip } from '../Components/Tooltip.svelte';

	interface StatusData {
		Label: string;
		Tooltip: string;
		Icon: string;
	}

	export let controller: OutputController<StatusData>;

	let component = new OutputComponentController({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	<span use:tooltip={controller.value.Tooltip}>
		{#if controller.value.Icon != null}
			<i class={controller.value.Icon} />
		{/if}
		{controller.value.Label}
	</span>
{/if}

<style lang="scss">
	i {
		margin-right: 5px;
		min-width: 15px;
		text-align: center;
	}
</style>