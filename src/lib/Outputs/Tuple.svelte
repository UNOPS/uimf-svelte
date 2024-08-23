<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import type { IFieldMetadata, IComponent } from '../Infrastructure/uimf';
	import Output from '../Output.svelte';

	interface TupleData {
		[id: string]: any;
	}

	interface Configuration {
		ItemTypes: IComponent[];
	}

	interface TupleMetadata extends IFieldMetadata<Configuration> {
		CustomProperties: {
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

	const getController = (item: IComponent, idx: number) => {
		let value = controller.value == null ? null : controller.value[`m_Item${idx}`];
		return new OutputController<any>({
			metadata: {
				Component: item,
				Label: '',
				Hidden: false,
				Id: Date.now().toString(),
				OrderIndex: 0
			},
			data: value,
			form: controller.form,
			app: controller.app
		});
	};
</script>

<div class={controller.metadata.CustomProperties?.cssClass} class:tuple={true}>
	{#each controller.metadata.Component.Configuration.ItemTypes as item, idx}
		<Output controller={getController(item, idx + 1)} nolayout={true} />
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
