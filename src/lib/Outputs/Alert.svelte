<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import type { OutputController } from '../Infrastructure/OutputController';

	interface AlertData {
		Icon: {
			Name: string;
		} | null;
		Text: string;
		CssClass: string;
		BackgroundColor: string | null;
	}

	export let controller: OutputController<AlertData>;

	let component = new OutputComponentController({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	<div class={`alert-body ${controller.value.CssClass}`} style:background={controller.value.BackgroundColor ?? "none"}>
		{#if controller.value.Icon}
			<i class={controller.value.Icon.Name} />
		{/if}
		{@html controller.value.Text}
	</div>
{/if}