<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import type { IFieldMetadata } from '$lib/Infrastructure/uimf';
	import Output from '../Output.svelte';

	interface Configuration {
		Properties: IFieldMetadata[];
	}

	class Controller extends OutputController<any, IFieldMetadata<Configuration>> {}

	export let controller: Controller;

	let fields: OutputController<any>[] = [];

	let component = new OutputComponent({
		refresh() {
			fields = controller.metadata.Component.Configuration.Properties.filter((t) => !t.Hidden)
				.sort((a, b) => a.OrderIndex - b.OrderIndex)
				.map((property) => {
					return new OutputController<any>({
						metadata: property,
						data: controller.value?.Value == null ? null : controller.value?.Value[property.Id],
						form: controller.form,
						app: controller.app
					});
				});
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

{#each fields as field}
	<Output controller={field} />
{/each}
