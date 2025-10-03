<script lang="ts" context="module">
	interface SimpleImage {
		Src: string;
		Alt: string | null;
		Width: string | null;
		Height: string | null;
		CssClass: string | null;
		Link: IFormlinkBase | null;
	}

	interface Configuration {
		CssClass?: string;
		Height?: string;
		ObjectFit?: string;
		Width?: string;
	}

	interface IMetadata extends IOutputFieldMetadata<Configuration> {}
</script>

<script lang="ts">
	import type { IOutputFieldMetadata } from '../../Infrastructure/Metadata';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { IFormlinkBase } from '../FormLink/IFormlinkBase';

	export let controller: OutputController<SimpleImage, IMetadata>;

	let cssClass: string | null = null;

	new OutputComponent({
		refresh() {
			controller.value = controller.value;

			// Combine CSS classes from value and component configuration
			const classes = [
				controller.value?.CssClass,
				controller.metadata?.Component?.Configuration?.CssClass
			].filter((c) => c != null && c.length > 0);

			cssClass = classes.length > 0 ? classes.join(' ') : null;
		}
	});
</script>

{#if controller.value?.Src}
	{#if controller.value.Link?.Form}
		{#await controller.app.makeUrl(controller.value.Link) then url}
			<a href={url}>
				<img
					src={controller.value.Src}
					alt={controller.value?.Alt || ''}
					width={controller.value?.Width || controller.metadata?.Component?.Configuration?.Width}
					height={controller.value?.Height || controller.metadata?.Component?.Configuration?.Height}
					class={cssClass}
					style:object-fit={controller.metadata?.Component?.Configuration?.ObjectFit}
				/>
			</a>
		{/await}
	{:else}
		<img
			src={controller.value.Src}
			alt={controller.value?.Alt || ''}
			width={controller.value?.Width || controller.metadata?.Component?.Configuration?.Width}
			height={controller.value?.Height || controller.metadata?.Component?.Configuration?.Height}
			class={cssClass}
			style:object-fit={controller.metadata?.Component?.Configuration?.ObjectFit}
		/>
	{/if}
{/if}
