<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import { tooltip } from '../../Components/Tooltip.svelte';

	interface LinkData {
		CssClass: string;
		Url: string;
		Tooltip: string;
		Icon: string;
		Label: string;
		RequiredPermission: string | null;
	}

	export let controller: OutputController<LinkData>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	{#if controller.app.hasPermission(controller.value.RequiredPermission)}
		<a
			class={controller.value.CssClass}
			href={controller.value.Url}
			use:tooltip={controller.value.Tooltip}
		>
			{#if controller.value.Icon != null}
				<i class={controller.value.Icon} />
			{/if}
			{controller.value.Label}</a
		>
	{:else}
		<span>{controller.value.Label}</span>
	{/if}
{/if}
