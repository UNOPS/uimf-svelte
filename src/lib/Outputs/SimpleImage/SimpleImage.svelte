<script lang="ts" context="module">
	interface SimpleImageLink {
		Form: string | null;
		InputFieldValues: Record<string, any> | null;
	}

	interface SimpleImage {
		Src: string;
		Alt: string | null;
		Width: string | null;
		Height: string | null;
		CssClass: string | null;
		Link: SimpleImageLink | null;
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
	{#if controller.value.Link?.Form}
		{#await controller.app.makeUrl({ Form: controller.value.Link.Form, InputFieldValues: controller.value.Link.InputFieldValues || {}, Action: 'redirect' }) then url}
			<a href={url}>
				<img
					src={controller.value.Src}
					alt={controller.value?.Alt || ''}
					width={controller.value?.Width || undefined}
					height={controller.value?.Height || undefined}
					class={controller.value?.CssClass || ''}
				/>
			</a>
		{/await}
	{:else}
		<img
			src={controller.value.Src}
			alt={controller.value?.Alt || ''}
			width={controller.value?.Width || undefined}
			height={controller.value?.Height || undefined}
			class={controller.value?.CssClass || ''}
		/>
	{/if}
{/if}