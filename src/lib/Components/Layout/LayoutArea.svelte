<script lang="ts" context="module">
	import type { InputController } from '../../Infrastructure/InputController';
	import type { OutputController } from '../../Infrastructure/OutputController';

	function asInput(controller: any): InputController<any> {
		return controller as InputController<any>;
	}

	function asOutput(controller: any): OutputController<any> {
		return controller as OutputController<any>;
	}
</script>

<script lang="ts">
	import type { LayoutAreaInstance } from './Layout.svelte';
	import Input from '../../Input.svelte';
	import Output from '../../Output.svelte';

	export let area: LayoutAreaInstance | null | undefined;
</script>

{#if area != null}
	<div class={area.Area?.AreaCssClass} class:ui-area={true}>
		{#each area.Fields as field}
			{#if field.isInput}
				<Input controller={asInput(field.controller)} />
			{:else}
				<Output controller={asOutput(field.controller)} />
			{/if}
		{/each}
	</div>
{:else}
	null-area
{/if}

<style lang="scss">
	.ui-area:not(:has(*)) {
		display: none;
	}
</style>
