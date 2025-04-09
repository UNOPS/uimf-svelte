<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputComponent } from '../Infrastructure/Component';
	import { OutputController } from '../Infrastructure/OutputController';
	import FormLink, { Controller, FormLinkData } from './FormLink.svelte';
	import { IOutputFieldMetadata } from '../Infrastructure/uimf';
	import { link } from 'd3';

	export let controller: OutputController<any>;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	const makeController = (value: FormLinkData) => {
		return new OutputController<FormLinkData>({
			metadata: {} as IOutputFieldMetadata,
			data: value,
			form: controller.form!,
			app: controller.app,
			parent: controller
		}) as Controller;
	};
</script>

{#if controller.value != null}
	<span>{controller.value.Quantity}</span>
	<i>*</i>
	{#if controller.value.Id != null}
		<FormLink controller={makeController(controller.value.PublicView)} />
	{:else}
		<a href="#/product/edit/{controller.value.ProductId}" title={controller.value.Supplier}
			>{controller.value.ProductName}
		</a>
	{/if}
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
