<script context="module" lang="ts">
	import { IComponent } from '../../Infrastructure/Metadata';

	export interface IClickableContentConfiguration {
		Content: IComponent;
	}

	export interface ClickableContentData extends KeyActionButtonData {
		Content: any;
	}

	export type ClickableContentController = OutputController<
		ClickableContentData,
		IOutputFieldMetadata<IClickableContentConfiguration>
	>;
</script>

<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import {
		defaultControlRegister as controlRegister,
		CreateOutputResult
	} from '../../Infrastructure/ControlRegister';
	import type { IOutputFieldMetadata } from '../../Infrastructure/Metadata';
	import Output from '../../Output.svelte';
	import { OutputFieldMetadataFactory } from '../../Infrastructure/Utilities/OutputFieldMetadataFactory';
	import { ActionHandler, KeyActionButtonData } from '../ActionButton/ActionHandler';
	import { ActionRegistry } from '../ActionButton/ActionRegistry';

	export let controller: ClickableContentController;

	let inner: CreateOutputResult | null = null;
	let handler: ActionHandler | null = null;
	let href: string | null = null;

	let component = new OutputComponent({
		async refresh() {
			inner = await getContentController();

			if (controller.value?.Parameters == null) {
				handler = null;
				href = null;
			} else {
				if (handler == null || handler.action != controller.value.Parameters.Action) {
					const HandlerClass = ActionRegistry[controller.value.Parameters.Action];
					handler = HandlerClass != null ? new HandlerClass(controller) : null;
				}

				href = (await handler?.getHref?.(controller.value)) ?? null;
			}

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	async function getContentController(): Promise<CreateOutputResult | null> {
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

		return field;
	}

	async function handleClick(value: ClickableContentData) {
		if (handler != null && handler.execute != null) {
			await handler.execute(value);
			component.refresh();
		} else if (handler == null) {
			console.error(`No handler found for action: ${value.Parameters?.Action}`);
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			if (controller.value != null) {
				handleClick(controller.value);
			}
		}
	}
</script>

{#if inner != null && controller.value?.Parameters != null}
	{#if handler?.renderAs === 'link' && href != null}
		<a class="ui-clickable-content" {href}>
			<Output controller={inner.controller} nolayout={true} />
		</a>
	{:else}
		<button
			type="button"
			class="ui-clickable-content"
			on:click={async () => await handleClick(controller.value)}
			on:keypress={handleKeyPress}
		>
			<Output controller={inner.controller} nolayout={true} />
			<svelte:component this={inner.component} controller={inner} />
		</button>
	{/if}
{/if}

<style lang="scss">
	.ui-clickable-content {
		cursor: pointer;
		user-select: none;

		&:focus {
			outline: 2px solid #0066cc;
			outline-offset: 2px;
		}
	}

	button.ui-clickable-content {
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
		text-align: inherit;
	}

	a.ui-clickable-content {
		text-decoration: none;
		color: inherit;

		&:hover {
			text-decoration: none;
		}
	}
</style>
