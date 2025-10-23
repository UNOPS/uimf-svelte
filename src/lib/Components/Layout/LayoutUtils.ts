import type { IFieldMetadata, IInputFieldMetadata, IOutputFieldMetadata } from '../../Infrastructure/Metadata';
import type {
	LayoutAreaInstance,
	LayoutFieldInstance,
	LayoutInstance
} from './Layout.svelte';
import type { ILayout } from './Metadata/ILayout';
import type { ILayoutItem } from './Metadata/ILayoutItem';
import type { ILayoutArea } from './Metadata/ILayoutArea';
import type { ILayoutContainer } from './Metadata/ILayoutContainer';
import { OutputController } from '../../Infrastructure/OutputController';
import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
import { Field } from '../../Infrastructure/Fields/Field';

export class LayoutUtils {
	/**
	 * Builds an array of layout fields for a layout.
	 * This method creates controller instances for each field defined in the layout,
	 * filtering out hidden fields and sorting them by OrderIndex.
	 *
	 * @param layout - The parent field controller containing the layout configuration
	 * @returns Array of nested fields, each with its own controller instance, sorted by OrderIndex
	 */
	static buildLayoutFields(layout: Field<IFieldMetadata<ILayout>>): LayoutFieldInstance[] {
		return layout.metadata.Component.Configuration.Fields
			.filter((t) => !t.Metadata.Hidden)
			.sort((a, b) => a.Metadata.OrderIndex - b.Metadata.OrderIndex)
			.map((property) => {
				let controllerClass = property.IsInput
					? controlRegister.inputs[property.Metadata.Component.Type].controller
					: null;

				return {
					isInput: property.IsInput,
					metadata: property.Metadata,
					controller: property.IsInput
						? new controllerClass!({
							parent: layout,
							metadata: property.Metadata as IInputFieldMetadata,
							form: layout.form,
							app: layout.app
						})
						: new OutputController<any, IOutputFieldMetadata>({
							metadata: property.Metadata as IOutputFieldMetadata,
							data: layout.value == null ? null : layout.value[property.Metadata.Id],
							form: layout.form,
							app: layout.app,
							parent: layout
						})
				};
			});
	}

	/**
	 * Recursively extracts all areas from a container tree.
	 * @param items - Layout items (containers or areas) to traverse
	 * @returns Flat array of all areas found in the tree
	 */
	private static extractAreas(items: ILayoutItem[]): ILayoutArea[] {
		const areas: ILayoutArea[] = [];

		for (const item of items) {
			if (item.Type === 'area') {
				areas.push(item as ILayoutArea);
			} else if (item.Type === 'container') {
				const container = item as ILayoutContainer;
				areas.push(...LayoutUtils.extractAreas(container.Children));
			}
		}

		return areas;
	}

	/**
	 * Builds a layout instance with nested containers and their associated fields.
	 * This method handles both input and output controllers and automatically extracts the necessary data.
	 * Recursively traverses container structure from backend to match fields with areas.
	 * @param layout - The parent field containing layout configuration
	 * @param prebuiltFields - Optional pre-built nested fields (useful when fields are already computed, e.g., in ComplexInputController.views)
	 * @returns Layout instance with nested containers and area-to-field mappings
	 */
	static buildLayout(
		layout: Field<IFieldMetadata<ILayout>>,
		prebuiltFields?: LayoutFieldInstance[]
	): LayoutInstance {
		let fields = prebuiltFields ?? LayoutUtils.buildLayoutFields(layout);
		let containers = layout.metadata.Component.Configuration.Containers ?? [];

		// Extract all areas from the container tree
		const allAreas = LayoutUtils.extractAreas(containers);

		// Build area instances dictionary
		let areaInstanceMap = new Map<string, LayoutAreaInstance>();

		for (let i = 0; i < fields.length; i++) {
			const fieldItem = fields[i];
			let areaName = fieldItem.metadata.CustomProperties?.LayoutField?.Area ?? 'default';

			// Make sure key is not null.
			const key = areaName;

			if (!areaInstanceMap.has(key)) {
				let area = allAreas.find((t) => t.Name == areaName);

				if (area == null) {
					area = {
						Type: 'area',
						AreaCssClass: null,
						FieldCssClass: null,
						Name: areaName,
						OrderIndex: 0
					} as ILayoutArea;

					containers.push({
						Children: [area],
						CssClass: null,
						Type: 'container'
					});
				}

				areaInstanceMap.set(key, {
					Area: area,
					Fields: []
				});
			}

			const areaInstance = areaInstanceMap.get(key)!;

			if (areaInstance == null) {
				console.error(`cannot find area`, fieldItem, key);
			}

			// Apply FieldCssClass from area to field metadata
			if (areaInstance.Area?.FieldCssClass != null) {
				fieldItem.metadata.CssClass ??= '';
				fieldItem.metadata.CssClass += ' ' + areaInstance.Area.FieldCssClass;
			}

			areaInstance.Fields.push(fieldItem);
		}

		return {
			Containers: containers,
			AreaInstances: areaInstanceMap
		};
	}
}
