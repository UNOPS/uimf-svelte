<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponent } from '../Infrastructure/Component';
	import type { OutputController } from '../Infrastructure/OutputController';

	export let controller: OutputController<any>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	<span>{controller.value.Quantity}</span>
	<i>*</i>
	<a href="#/product/edit/{controller.value.ProductId}" title={controller.value.Supplier}
		>{controller.value.ProductName}
	</a>
	{#if controller.value.Id != null}
		<small>#{controller.value.Id}</small>
	{/if}
{/if}

<style lang="scss">
	i {
		color: #c7c7c7;
		font-size: 10px;
		font-style: normal;
		padding: 5px;
		position: relative;
		top: -1px;
	}

	small {
		opacity: 0.6;
	}
</style>
