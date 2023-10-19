<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponent } from '../Infrastructure/Component';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { tooltip } from '../Components/Tooltip.svelte';

	interface Sequence {
		CssClass: string;
		Separator: string;
		Items: SequenceItem[];
	}

	interface SequenceItem {
		Label: string;
		Tooltip: string;
	}

	export let controller: OutputController<Sequence>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	<div class={controller.value.CssClass}>
		{#each controller.value.Items as item, index}
			{#if index != 0}
				<span class="sq-separator">{@html controller.value.Separator}</span>
			{/if}
			<span class="sq-term" use:tooltip={item.Tooltip}>{@html item.Label}</span>
		{/each}
	</div>
{/if}

<style lang="scss">
	@import '../../scss/styles.scss';

	div {
		white-space: nowrap;

		& > .sq-term {
			padding: 0px 3px;
			display: inline-block;
			margin: 0;
		}

		& > .sq-separator {
			padding: 0px 3px;
			display: inline-block;
			margin: 0;
			color: $body-color;
			opacity: 0.4;
			position: relative;
			top: -1px;
		}
	}
</style>
