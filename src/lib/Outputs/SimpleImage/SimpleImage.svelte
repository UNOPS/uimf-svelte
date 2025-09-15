<script lang="ts" context="module">
	interface SimpleImage {
		Src: string;
		Alt: string | null;
		Width: string | null;
		Height: string | null;
		CssClass: string | null;
	}
</script>

<script lang="ts">
	import { OutputComponent } from '../../Infrastructure/Component';
	import { OutputController } from '../../Infrastructure/OutputController';

	export let controller: OutputController<SimpleImage>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});
</script>

{#if controller.value?.Src}
	<img
		src={controller.value.Src}
		alt={controller.value?.Alt || ''}
		width={controller.value?.Width || undefined}
		height={controller.value?.Height || undefined}
		class={controller.value?.CssClass || ''}
	/>
{/if}