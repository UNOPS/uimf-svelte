<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { tooltip } from '../../Components/Tooltip.svelte';
	import type { ActionButtonData, ActionHandler } from './ActionHandler';
	import { SetFieldValuesHandler } from './Actions/SetFieldValuesHandler';
	import { PrintHandler } from './Actions/PrintHandler';

	export let controller: OutputController<ActionButtonData>;
	let handler: ActionHandler | null;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;

			if (controller.value?.Parameters == null) {
				handler = null;
			} else {
				if (handler == null || handler.action != controller.value.Parameters.Action) {
					const HandlerClass = handlers[controller.value.Parameters.Action];
					handler ??= new HandlerClass(controller);
				}
			}
		}
	});

	// Simple handler registry
	const handlers: Record<string, any> = {
		'set-field-values': SetFieldValuesHandler,
		print: PrintHandler
	};

	beforeUpdate(async () => await component.setup(controller));

	async function handle(value: ActionButtonData) {
		if (handler != null) {
			await handler.execute(value);

			component.refresh();
		} else {
			console.warn(`No handler found for action: ${value.Parameters.Action}`);
		}
	}
</script>

{#if controller.value?.Parameters != null}
	<button
		type="button"
		class={controller.value.CssClass || 'btn btn-primary'}
		use:tooltip={controller.value.Tooltip}
		on:click={async () => await handle(controller.value)}
	>
		{#if controller.value.Icon}
			<i class={controller.value.Icon} aria-hidden="true" />
		{/if}
		{#if controller.value.Label}
			{controller.value.Label}
		{/if}
	</button>
{/if}

<style lang="scss">
	button {
		display: flex;
		align-items: center;
		gap: 8px;
	}
</style>
