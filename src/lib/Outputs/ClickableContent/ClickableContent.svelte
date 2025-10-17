<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
	import type { IOutputFieldMetadata } from '../../Infrastructure/Metadata';
	import Output from '../../Output.svelte';
	import type { ActionHandler, ClickableContentData } from './ActionHandler';
	import { RedirectToUrlHandler } from './Actions/RedirectToUrlHandler';

	interface Configuration {
		Content: IOutputFieldMetadata[];
	}

	interface ContentField {
		component: any;
		controller: OutputController<any>;
	}

	class ClickableContentController extends OutputController<
		ClickableContentData,
		IOutputFieldMetadata<Configuration>
	> {}

	export let controller: ClickableContentController;

	let contentField: ContentField | null = null;
	let handler: ActionHandler | null = null;

	// Handler registry
	const handlers: Record<string, any> = {
		'redirect-to-url': RedirectToUrlHandler
	};

	let component = new OutputComponent({
		refresh() {
			contentField = getContentController();

			if (controller.value?.Parameters == null) {
				handler = null;
			} else {
				if (handler == null || handler.action != controller.value.Parameters.Action) {
					const HandlerClass = handlers[controller.value.Parameters.Action];
					handler = HandlerClass != null ? new HandlerClass(controller) : null;
				}
			}

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	function getContentController(): ContentField | null {
		const contentMetadata = controller.metadata?.Component?.Configuration?.Content;

		if (contentMetadata == null || contentMetadata.length === 0) {
			return null;
		}

		const field = controlRegister.createOutput({
			props: {
				metadata: contentMetadata[0],
				app: controller.app,
				form: controller.form,
				data: null,
				parent: controller
			}
		});

		if (controller.value?.Content != null) {
			field.controller.setValue(controller.value.Content);
		}

		return field;
	}

	async function handle(value: ClickableContentData) {
		if (handler != null) {
			await handler.execute(value);
			component.refresh();
		} else {
			console.warn(`No handler found for action: ${value.Parameters?.Action}`);
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			if (controller.value != null) {
				handle(controller.value);
			}
		}
	}
</script>

{#if contentField != null && controller.value?.Parameters != null}
	<div
		class="clickable-content"
		role="button"
		tabindex="0"
		on:click={async () => await handle(controller.value)}
		on:keypress={handleKeyPress}
	>
		<Output controller={contentField.controller} />
	</div>
{/if}

<style lang="scss">
	.clickable-content {
		cursor: pointer;
		user-select: none;

		&:focus {
			outline: 2px solid #0066cc;
			outline-offset: 2px;
		}
	}
</style>