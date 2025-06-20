<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { tooltip } from '../../Components/Tooltip.svelte';

	interface IconData {
		Name: string;
		Tooltip: string;
	}

	export let controller: OutputController<IconData>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	<i class={controller.value.Name} use:tooltip={controller.value.Tooltip} />
{/if}
