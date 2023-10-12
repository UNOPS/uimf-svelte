<script lang="ts" context="module">
	interface Image {
		Source: string;
		MaxWidth: string;
	}
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';

	export let controller: OutputController<Image>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	<img
		class="output-image"
		style="max-width: {controller.value.MaxWidth};"
		src={controller.value.Source}
		alt="img"
	/>
{/if}

<style lang="scss">
	@import '../../scss/styles.scss';

	.output-image {
		height: auto;
	}
</style>
