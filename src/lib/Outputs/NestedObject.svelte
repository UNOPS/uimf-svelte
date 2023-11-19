<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import type { ComponentMetadata } from '$lib/Infrastructure/uimf';
	import Output from '../Output.svelte';

	interface NestedObjectMetadata extends ComponentMetadata {
		CustomProperties: {
			Properties: ComponentMetadata[];
			Customizations: any;
		};
	}

	class Controller extends OutputController<any, NestedObjectMetadata> {
	}

	export let controller: Controller;

	let fields: OutputController<any>[] = [];

	let component = new OutputComponent({
		refresh() {
			fields = controller.metadata.CustomProperties.Properties.filter((t) => !t.Hidden)
				.sort((a, b) => a.OrderIndex - b.OrderIndex)
				.map((property) => {
					return new OutputController<any>({
						metadata: property,
						data: controller.value?.Value == null ? null : controller.value.Value[property.Id],
						form: controller.form,
						app: controller.app
					});
				});

			controller.value = controller.value;
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#each fields as field}
	<Output controller={field} />
{/each}
