<script lang="ts" context="module">
	export { ComplexInputController as Controller } from './ComplexInputController';
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';

	import { InputComponent } from '../../Infrastructure/Component';
	import Input from '../../Input.svelte';
	import { ComplexInputController } from './ComplexInputController';

	export let controller: ComplexInputController;

	let component = new InputComponent({
		refresh() {
			controller.views = controller.views;
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});
</script>

<div class={controller.metadata.Component.Configuration?.CssClass}>
	{#each controller.views as view}
		<div class={controller.metadata.Component.Configuration?.CssClassEach}>
			<Input controller={view.controller} />
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
