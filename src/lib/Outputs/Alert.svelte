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
	<div class={controller.value.CssClass} role="alert">
		{#if controller.value.Icon}
			<i class={controller.value.Icon.Name} />
		{/if}
		{@html controller.value.Text}
	</div>
{/if}

<style lang="scss">
	@import '../../scss/styles.scss';

	.alert {
		& > i:first-child {
			float: left;
			margin: 3px 6px 0 1px;
		}
	}
</style>
