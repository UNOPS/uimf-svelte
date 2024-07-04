<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';

	export let controller: OutputController<string>;
	export let showLabel: boolean = false;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	{#if showLabel}
		<div class="label">{controller.metadata.Label} :</div>
	{/if}

	<span class={controller.metadata.CustomProperties?.cssClass}>{@html controller.value}</span>
{/if}

<style>
	.label {
		font-weight: bold;
		font-size: medium;
		color: black;
		text-align: left;
		padding: 0.6em 0em 0em;
	}

	.title {
		font-weight: bold;
		font-size: larger;
		color: #000;
		text-align: left;
		padding: 0.6em 0.5em;
		margin: 20px 0px 2px;
		background-color: #ebebeb;
		display: block;
	}
</style>
