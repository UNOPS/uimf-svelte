<script lang="ts" context="module">
	export { ComplexInputController as Controller } from './ComplexInputController';
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';

	import { InputComponent } from '../../Infrastructure/Component';
	import Input from '../../Input.svelte';
	import type { ComplexInputController } from './ComplexInputController';
	import { InputController } from '../../Infrastructure/InputController';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import Output from '../../Output.svelte';

	export let controller: ComplexInputController;

	let component = new InputComponent({
		refresh() {
			controller.views = controller.views;
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});

	function asInput(controller: any): InputController<any> {
		return controller as InputController<any>;
	}

	function asOutput(controller: any): OutputController<any> {
		return controller as OutputController<any>;
	}
</script>

<div class={controller.metadata.Component.Configuration?.CssClass} class:complex-input={true}>
	{#each controller.views as view}
		<div class={controller.metadata.Component.Configuration?.CssClassEach}>
			{#if !view.metadata.Hidden}
				{#if view.isInput}
					<Input controller={asInput(view.controller)} />
				{:else}
					<Output controller={asOutput(view.controller)} />
				{/if}
			{/if}
		</div>
	{/each}
</div>

<style>
	div {
		margin-bottom: 20px;
	}

	.column-200 {
		width: 200px;
	}

	.column-300 {
		width: 300px;
	}

	.column-700 {
		width: 700px;
	}
</style>
