<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponentController } from '../Infrastructure/ComponentController';
	import type { ComponentMetadata } from '../Infrastructure/uimf';
	import Output from '../Output.svelte';

	interface TupleData {
		[id: string]: any;
	}

	interface TupleMetadata extends ComponentMetadata {
		CustomProperties: {
			ItemTypes: ComponentMetadata[];
			CssClass: string;
		};
	}

	class TupleController extends OutputController<TupleData> {
		declare metadata: TupleMetadata;
	}

	export let controller: TupleController;

	let component = new OutputComponentController({
		refresh() {
			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));

	const getController = (item: ComponentMetadata, idx: number) => {
		let value = controller.value == null ? null : controller.value[`m_Item${idx}`];
		return new OutputController<any>(
			{
				metadata: item,
				data: value,
				form: controller.form!,
				app: controller.app
			}
		);
	};

</script>

<div class={controller.metadata.CustomProperties.CssClass ?? ''}>
	{#each controller.metadata.CustomProperties.ItemTypes as item, idx}
		<Output controller={getController(item, idx + 1)} hideLabel={true} />
	{/each}
</div>