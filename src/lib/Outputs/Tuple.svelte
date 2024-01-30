<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import type { ComponentMetadata } from '../Infrastructure/uimf';
	import Output from '../Output.svelte';

	interface TupleData {
		[id: string]: any;
	}

	interface TupleMetadata extends ComponentMetadata {
		CustomProperties: {
			ItemTypes: ComponentMetadata[];
			cssClass: string;
		};
	}

	class TupleController extends OutputController<TupleData, TupleMetadata> {}

	export let controller: TupleController;

	let component = new OutputComponent({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	const getController = (item: ComponentMetadata, idx: number) => {
		let value = controller.value == null ? null : controller.value[`m_Item${idx}`];
		return new OutputController<any>({
			metadata: item,
			data: value,
			form: controller.form,
			app: controller.app
		});
	};
</script>

<div class={controller.metadata.CustomProperties.cssClass} class:tuple={true}>
	{#each controller.metadata.CustomProperties.ItemTypes as item, idx}
		<Output controller={getController(item, idx + 1)} hideLabel={true} />
	{/each}
</div>

<style lang="scss">
	:global(div.tuple > *) {
		margin-right: 8px;
	}

	:global(div.tuple > *:last-child) {
		margin-right: 0;
	}
</style>
