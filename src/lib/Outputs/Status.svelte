<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import { tooltip } from '../Components/Tooltip.svelte';

	interface StatusData {
		Label: string;
		Tooltip: string | null;
		Icon: string | null;
		CssClass: string | null;
	}

	export let controller: OutputController<StatusData>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	<span use:tooltip={controller.value.Tooltip} class={controller.value.CssClass}>
		{#if controller.value.Icon != null}
			<i class={controller.value.Icon} />
		{/if}
		{#if controller.value.Label != null}
			{controller.value.Label}
		{/if}
	</span>
{/if}

<style lang="scss">
	@import '../../scss/styles.variables.scss';

	i {
		padding-left: 0;
		margin-left: 0;
		margin-right: 5px;
		min-width: 15px;
		text-align: center;
	}

	:global(.badge > i) {
		margin-right: 0;
	}
</style>
