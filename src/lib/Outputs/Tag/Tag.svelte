<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { tooltip } from '../../Components/Tooltip.svelte';

	interface TagData {
		Color: string;
		Tooltip: string;
		Label: string;
		FontColor?: string;
	}

	export let controller: OutputController<TagData>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	<span
		class="badge"
		style:background-color={controller.value.Color}
		style:color={controller.value.FontColor}
		use:tooltip={controller.value.Tooltip != null
			? controller.value.Tooltip.replace(/'/g, '&apos;')
			: ''}
	>
		{@html controller.value.Label}
	</span>
{/if}

<style lang="scss">
	.badge {
		color: #fff;
		background-color: RGBA(var(--bs-secondary-rgb), var(--bs-bg-opacity, 1));
		border-radius: 3px;
	}
</style>
