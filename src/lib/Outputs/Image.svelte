<script lang="ts" context="module">
	interface Image {
		Source: string;
		MaxWidth: string | null;
		AltText: string | null;
		Url: string | null;
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
	{#if controller.value.Url != null}
		<a href={controller.value.Url}>
			<img
				class="output-image"
				style:max-width={controller.value.MaxWidth}
				src={controller.value.Source}
				alt={controller.value.AltText}
			/></a
		>
	{:else}
		<img
			class="output-image"
			style:max-width={controller.value.MaxWidth}
			src={controller.value.Source}
			alt={controller.value.AltText}
		/>
	{/if}
{/if}

<style lang="scss">
	@import '../scss/styles.variables.scss';

	.output-image {
		height: auto;
	}
</style>
