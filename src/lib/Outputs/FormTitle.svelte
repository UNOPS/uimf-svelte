<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import { IOutputFieldMetadata } from '../Infrastructure/uimf';

	interface IData {
		Value: string | null;
	}

	interface IConfiguration {
		CssClass: string | null;
	}

	export let controller: OutputController<IData, IOutputFieldMetadata<IConfiguration>>;

	let title: string | null = null;

	let component = new OutputComponent({
		refresh() {
			const titleInResponse = controller.value?.Value;

			title = titleInResponse != null ? titleInResponse : controller.form?.metadata?.Label ?? null;

			if (controller.form?.useUrl === true) {
				document.title = title ?? document.title;
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if title != null && title.length > 0}
	<div class={controller.metadata.Component.Configuration?.CssClass}>
		{@html title}
	</div>
{/if}

<style lang="scss">
</style>
