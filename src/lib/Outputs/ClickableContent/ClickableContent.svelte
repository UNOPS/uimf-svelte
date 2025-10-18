<script context="module" lang="ts">
	import { IComponent } from '../../Infrastructure/Metadata';
	import { RedirectToUrlHandler } from './Actions/RedirectToUrlHandler';

	export interface IClickableContentConfiguration {
		Content: IComponent;
	}

	export interface ClickableContentData {
		Content: any;
		Parameters: { Action: string; [key: string]: any };
	}

	export type ClickableContentController = OutputController<
		ClickableContentData,
		IOutputFieldMetadata<IClickableContentConfiguration>
	>;

	const handlers: Record<string, any> = {
		'redirect-to-url': RedirectToUrlHandler
	};
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
	import type { IOutputFieldMetadata } from '../../Infrastructure/Metadata';
	import Output from '../../Output.svelte';
	import type { ActionHandler } from './ActionHandler';

	import { OutputFieldMetadataFactory } from '../../Infrastructure/Utilities/OutputFieldMetadataFactory';

	export let controller: ClickableContentController;

	let innerContent: OutputController<any> | null = null;
	let handler: ActionHandler | null = null;
	let href: string | null = null;

	let component = new OutputComponent({
		async refresh() {
			innerContent = await getContentController();

			if (controller.value?.Parameters == null) {
				handler = null;
				href = null;
			} else {
				if (handler == null || handler.action != controller.value.Parameters.Action) {
					const HandlerClass = handlers[controller.value.Parameters.Action];
					handler = HandlerClass != null ? new HandlerClass(controller) : null;
				}

				href = handler?.getHref?.(controller.value) ?? null;
			}

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	async function getContentController(): Promise<OutputController<any> | null> {
		const contentMetadata = controller.metadata?.Component?.Configuration?.Content;

		if (contentMetadata == null) {
			return null;
		}

		const field = controlRegister.createOutput({
			props: {
				metadata: OutputFieldMetadataFactory.fromComponent(contentMetadata),
				app: controller.app,
				form: controller.form,
				data: null,
				parent: controller
			}
		});

		if (controller.value?.Content != null) {
			await field.controller.setValue(controller.value.Content);
		}

		return field.controller;
	}

	async function handle(value: ClickableContentData) {
		if (handler != null && handler.execute != null) {
			await handler.execute(value);
			component.refresh();
		} else if (handler == null) {
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

{#if innerContent != null && controller.value?.Parameters != null}
	{#if handler?.renderAs === 'link' && href != null}
		<a class="clickable-content" {href}>
			<Output controller={innerContent} nolayout={true} />
		</a>
	{:else}
		<button
			type="button"
			class="clickable-content"
			on:click={async () => await handle(controller.value)}
			on:keypress={handleKeyPress}
		>
			<Output controller={innerContent} nolayout={true} />
		</button>
	{/if}
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

	button.clickable-content {
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
		text-align: inherit;
	}

	a.clickable-content {
		text-decoration: none;
		color: inherit;

		&:hover {
			text-decoration: none;
		}
	}
</style>
