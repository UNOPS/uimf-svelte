<script lang="ts" context="module">
	import type { LayoutInstance } from '../../Components/Layout/Layout.svelte';

	export { ComplexInputController as Controller } from './ComplexInputController';
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { InputComponent } from '../../Infrastructure/Component';
	import type { ComplexInputController } from './ComplexInputController';
	import { LayoutUtils } from '../../Components/Layout/LayoutUtils';
	import Layout from '../../Components/Layout/Layout.svelte';

	export let controller: ComplexInputController;

	let layout: LayoutInstance;

	let component = new InputComponent({
		init() {
			layout = LayoutUtils.buildLayout(controller, controller.views);
		}
	});

	beforeUpdate(async () => {
		await component.setup(controller);
	});
</script>

<div class={controller.metadata.Component.Configuration?.CssClass} class:complex-input={true}>
	<Layout {layout} />
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
