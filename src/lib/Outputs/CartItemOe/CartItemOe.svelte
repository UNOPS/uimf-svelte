<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponent } from '../../Infrastructure/Component';
	import type { OutputController } from '../../Infrastructure/OutputController';
	import { tooltip } from '../../Components/Tooltip.svelte';

	interface ICartItemOe {
		Id: number | null;
		OptionalEquipmentId: number;
		OptionalEquipmentName: string;
		Quantity: number;
		Supplier: string;
		ChangesProductShippingDimensions: boolean;
	}

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
	<a
		href="#/OptionalEquipment/edit/{controller.value.OptionalEquipmentId}"
		title={controller.value.Supplier}
		>{controller.value.OptionalEquipmentName}
	</a>
	{#if controller.value.Id != null}
		<small>#{controller.value.Id}</small>
	{/if}
	{#if controller.value.ChangesProductShippingDimensions}
		<i
			class="fa fa-expand-arrows-alt"
			use:tooltip={"This item increases product's shipping dimensions."}
		/>
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
