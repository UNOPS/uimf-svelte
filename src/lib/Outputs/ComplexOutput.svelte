<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../Infrastructure/OutputController';
	import { OutputComponent } from '../Infrastructure/Component';
	import type { IFieldMetadata } from '$lib/Infrastructure/uimf';
	import Output from '../Output.svelte';

	interface Configuration {
		CssClass: string;
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
						data: controller.value == null ? null : controller.value[property.Id],
						form: controller.form,
						app: controller.app,
						parent: controller
					});
				});
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<div class={controller.metadata.Component.Configuration?.CssClass} class:complex-output={true}>
	{#each fields as field}
		<Output controller={field} />
	{/each}
</div>

<style lang="scss">
	:global(.output > div) > .complex-output {
		// Offset the padding applied by the output component.
		// This way each level of nested output components
		// won't be adding extra padding.
		margin-left: -15px;
		margin-right: -15px;
	}
</style>
