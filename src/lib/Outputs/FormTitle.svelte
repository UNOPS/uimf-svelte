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
				document.title = getTextFromHtml(title ?? document.title);
			}
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function replaceNewlines(node: HTMLElement) {
		if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
			const spaceNode = document.createTextNode(' ');
			node.parentNode?.replaceChild(spaceNode, node);
		} else if (node.nodeType === Node.ELEMENT_NODE) {
			node.childNodes.forEach((t) => replaceNewlines(t as HTMLElement));
		}
	}

	function getTextFromHtml(htmlString: string): string {
		const element = document.createElement('div');
		element.innerHTML = htmlString;
		element.childNodes.forEach((t) => replaceNewlines(t as HTMLElement));

		return element.innerText;
	}
</script>

{#if title != null && title.length > 0}
	<div class={controller.metadata.Component.Configuration?.CssClass}>
		{@html title}
	</div>
{/if}

<style lang="scss">
</style>
