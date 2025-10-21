<script lang="ts" context="module">
	import type { ComplexLayoutInstance } from '../../Components/ComplexLayout/ComplexLayout.svelte';

	export { ComplexInputController as Controller } from './ComplexInputController';
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../../Infrastructure/Component';
	import type { ComplexInputController } from './ComplexInputController';
	import { ComplexLayoutUtils } from '../../Components/ComplexLayout/ComplexLayoutUtils';
	import ComplexLayout from '../../Components/ComplexLayout/ComplexLayout.svelte';

	export let controller: ComplexInputController;

	let layout: ComplexLayoutInstance;

	let component = new InputComponent({
		refresh() {
			layout = ComplexLayoutUtils.buildLayout(controller, controller.views);
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});
</script>

<div class={controller.metadata.Component.Configuration?.CssClass} class:complex-input={true}>
	<ComplexLayout {layout} />
</div>

<style lang="scss">
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
