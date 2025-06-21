<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { OutputController } from '../../Infrastructure/OutputController';
	import { OutputComponent } from '../../Infrastructure/Component';
	import type { IOutputFieldMetadata } from '../../Infrastructure/uimf';
	import Output from '../../Output.svelte';

	interface IComplexOutputFieldMetadata extends IOutputFieldMetadata {
		CustomProperties?: {
			ComplexOutputItem?: {
				Area: string;
			};
		};
	}

	interface IArea {
		Name: string | null;
		CssClass: string | null;
		OrderIndex: number;
	}

	interface Configuration {
		CssClass: string;
		Fields: IComplexOutputFieldMetadata[];
		Areas: IArea[] | null;
	}

	type NestedField = OutputController<any, IComplexOutputFieldMetadata>;

	class Controller extends OutputController<any, IOutputFieldMetadata<Configuration>> {}

	export let controller: Controller;

	let areas: { Area: IArea | null; Items: NestedField[] }[] = [];

	let component = new OutputComponent({
		refresh() {
			let fields = controller.metadata.Component.Configuration.Fields.filter((t) => !t.Hidden)
				.sort((a, b) => a.OrderIndex - b.OrderIndex)
				.map((property) => {
					return new OutputController<any, IComplexOutputFieldMetadata>({
						metadata: property,
						data: controller.value == null ? null : controller.value[property.Id],
						form: controller.form,
						app: controller.app,
						parent: controller
					});
				});

			let results: Record<string, { Area: IArea | null; Fields: NestedField[] }> = {};

			for (let i = 0; i < fields.length; i++) {
				const field = fields[i];
				let areaName = field.metadata.CustomProperties?.ComplexOutputItem?.Area ?? null;

				// Make sure key is not null.
				const key = areaName ?? '';

				if (!results[key]) {
					let area =
						controller.metadata.Component.Configuration.Areas?.find((t) => t.Name == areaName) ??
						null;

					results[key] = {
						Area: area,
						Fields: []
					};
				}

				results[key].Fields.push(field);
			}

			// Sort `results` entries by `Area.OrderIndex` and put in array.
			areas = Object.entries(results)
				.map(([_, value]) => {
					return { Area: value.Area, Items: value.Fields };
				})
				.sort((a, b) => (a.Area?.OrderIndex ?? 0) - (b.Area?.OrderIndex ?? 0));
		}
	});

	beforeUpdate(async () => await component.setup(controller));
</script>

<div class={controller.metadata.Component.Configuration?.CssClass} class:complex-output={true}>
	{#each areas as area}
		<div class={area.Area?.CssClass}>
			{#each area.Items as field}
				<Output controller={field} />
			{/each}
		</div>
	{/each}
</div>

<style lang="scss">
</style>
