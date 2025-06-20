<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { tooltip } from '../../Components/Tooltip.svelte';

	export let controller: OutputController<any>;

	let empty: boolean = true;
	let formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;

			if (controller.value != null) {
				empty = controller.value.IsContainerized
					? controller.value.TwentyFootContainers === 0 &&
					  controller.value.FortyFootContainers === 0 &&
					  controller.value.FortyFootHcContainers === 0 &&
					  controller.value.OtherContainers === 0
					: controller.value.Volume === 0 &&
					  controller.value.Weight === 0 &&
					  controller.value.Cars === 0;
			} else {
				empty = true;
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	{#if empty}
		<span>N/A</span>
	{:else if controller.value.IsContainerized}
		<div class="containerized">
			{#if controller.value.TwentyFootContainers > 0}
				<span>
					{controller.value.TwentyFootContainers}<span class="unit">x20&quot;</span>
				</span>
			{/if}

			{#if controller.value.FortyFootContainers > 0}
				<span>
					{controller.value.FortyFootContainers}<span class="unit">x40&quot;</span>
				</span>
			{/if}

			{#if controller.value.FortyFootHcContainers > 0}
				<span>
					{controller.value.FortyFootHcContainers}<span class="unit">x40HC</span>
				</span>
			{/if}

			{#if controller.value.OtherContainers > 0}
				<span>
					{controller.value.OtherContainers}<span
						class="unit"
						use:tooltip={controller.value.OtherContainerType}>xOTHER</span
					>
				</span>
			{/if}
		</div>
	{:else}
		<div class="non-containerized">
			{#if controller.value.Weight > 0}
				<span>
					{formatter.format(controller.value.Weight)}<span class="unit">kg</span>
				</span>
			{/if}

			{#if controller.value.Volume > 0}
				<span>
					{formatter.format(controller.value.Volume)}<span class="unit">m<sup>3</sup></span>
				</span>
			{/if}

			{#if controller.value.Cars > 0}
				<span>
					{formatter.format(controller.value.Cars)}<span class="unit">cars</span>
				</span>
			{/if}
		</div>
	{/if}
{/if}

<style>
	div > span > .unit {
		font-size: 0.9em;
		opacity: 0.5;
		margin-left: 2px;
	}

	div > span {
		margin-right: 5px;
	}

	div > span:last-of-type {
		margin-right: 0;
	}

	.non-containerized {
		background: #f1f1f1;
		border-radius: 3px;
		padding: 2px 4px;
		display: inline-block;
	}

	.containerized {
		background: #e8f6ff;
		border-radius: 3px;
		padding: 2px 4px;
		display: inline-block;
	}
</style>
