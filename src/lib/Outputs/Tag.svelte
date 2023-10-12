<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import { tooltip } from '../Components/Tooltip.svelte';

	interface TagData {
		Color: string;
		Tooltip: string;
		Label: string;
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
		class="label label-default"
		style={controller.value.Color != null ? `background-color: ${controller.value.Color}` : ''}
		use:tooltip={controller.value.Tooltip != null
			? controller.value.Tooltip.replace(/'/g, '&apos;')
			: ''}
	>
		{@html controller.value.Label}
	</span>
{/if}

<style>
	form-output-tag > .label {
		border-radius: 2px !important;
		vertical-align: text-bottom;
		color: black;
	}

	form-output-tuple > * > .output-tag > form-output-tag > .label {
		font-size: 10px;
		line-height: 1.2em;
		display: inline-block;
	}
</style>
