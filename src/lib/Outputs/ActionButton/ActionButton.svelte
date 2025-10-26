<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { tooltip } from '../../Components/Tooltip.svelte';
	import type { ActionButtonData, ActionHandler } from './ActionHandler';
	import { ActionRegistry } from './ActionRegistry';

	export let controller: OutputController<ActionButtonData>;
	let handler: ActionHandler | null;
	let href: string | null = null;

	let component = new OutputComponent({
		async refresh() {
			controller.value = controller.value;

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
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	async function handleClick(value: ActionButtonData) {
		if (handler != null && handler.execute != null) {
			await handler.execute(value);

			component.refresh();
		} else if (handler == null) {
			console.error(`No handler found for action: ${value.Parameters.Action}`);
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

{#if controller.value?.Parameters != null}
	{#if handler?.renderAs === 'link' && href != null}
		<a {href} class={controller.value.CssClass} use:tooltip={controller.value.Tooltip}>
			{#if controller.value.Icon}
				<i class={controller.value.Icon} aria-hidden="true" />
			{/if}
			{#if controller.value.Label}
				{controller.value.Label}
			{/if}
		</a>
	{:else}
		<button
			type="button"
			class={controller.value.CssClass || 'btn btn-primary'}
			use:tooltip={controller.value.Tooltip}
			on:click={async () => await handleClick(controller.value)}
			on:keypress={handleKeyPress}
		>
			{#if controller.value.Icon}
				<i class={controller.value.Icon} aria-hidden="true" />
			{/if}
			{#if controller.value.Label}
				{controller.value.Label}
			{/if}
		</button>
	{/if}
{/if}

<style lang="scss">
	button {
		display: flex;
		align-items: center;
		gap: 8px;
	}
</style>
