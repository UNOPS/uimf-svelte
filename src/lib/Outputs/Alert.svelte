<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponent } from '../Infrastructure/Component';
	import type { OutputController } from '../Infrastructure/OutputController';

	interface AlertData {
		Icon: {
			Name: string;
		} | null;
		Text: string;
		CssClass: string;
	}

	export let controller: OutputController<AlertData>;

	let component = new OutputComponent({
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
	@import '../../scss/styles.variables.scss';

	.alert {
		& > i:first-child {
			float: left;
			margin: 3px 6px 0 1px;
		}
	}

	div.documentation {
		background: #e2f6ff;
		border: 1px solid #cbe1e8;
		box-shadow: none;
		border-radius: 2px;
		border-width: 1px 0 2px 0;
		color: #1b4350;
		padding: 15px;
	}
</style>
