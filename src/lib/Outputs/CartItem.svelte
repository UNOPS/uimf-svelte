<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import type { OutputController } from '../Infrastructure/OutputController';

	export let controller: OutputController<any>;

	let component = new OutputComponentController({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#if controller.value != null}
	<span>{controller.value.Quantity}</span>
	<i> * </i>
	<a href="#/product/edit/{controller.value.ProductId}" title={controller.value.Supplier}
		>{controller.value.ProductName}
	</a>
	{#if controller.value.Id != null}
		#{controller.value.Id}
	{/if}
{/if}
