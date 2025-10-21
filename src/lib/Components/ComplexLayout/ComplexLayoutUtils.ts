import type { IFieldMetadata, IInputFieldMetadata, IOutputFieldMetadata } from '../../Infrastructure/Metadata';
import type {
	IComplexLayout,
	NestedField,
	ComplexLayoutAreaInstance,
	ComplexLayoutInstance,
	IComplexOutputFieldMetadata,
	ILayoutItem,
	IComplexLayoutArea,
	ILayoutContainer
} from './ComplexLayout.svelte';
import { OutputController } from '../../Infrastructure/OutputController';
import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
import { Field } from '../../Infrastructure/Fields/Field';

export class ComplexLayoutUtils {
	/**
	 * Builds an array of nested fields from a complex layout field configuration.
	 * This method creates controller instances for each field defined in the configuration,
	 * filtering out hidden fields and sorting them by OrderIndex.
	 *
	 * @param field - The parent field controller containing the complex layout configuration
	 * @returns Array of nested fields, each with its own controller instance, sorted by OrderIndex
	 */
	static buildNestedFields(field: Field<IFieldMetadata<IComplexLayout>>): NestedField[] {
		return field.metadata.Component.Configuration.Fields
			.filter((t) => !t.Metadata.Hidden)
			.sort((a, b) => a.Metadata.OrderIndex - b.Metadata.OrderIndex)
			.map((property) => {
				let controllerClass = property.IsInput
					? controlRegister.inputs[property.Metadata.Component.Type].controller
					: null;

				return {
					isInput: false,
					metadata: property.Metadata,
					controller: property.IsInput
						? new controllerClass!({
							parent: field,
							metadata: property.Metadata as IInputFieldMetadata,
							form: field.form,
							app: field.app
						})
						: new OutputController<any, IComplexOutputFieldMetadata>({
							metadata: property.Metadata as IOutputFieldMetadata,
							data: field.value == null ? null : field.value[property.Metadata.Id],
							form: field.form,
							app: field.app,
							parent: field
						})
				};
			});
	}

	/**
	 * Recursively extracts all areas from a container tree.
	 * @param items - Layout items (containers or areas) to traverse
	 * @returns Flat array of all areas found in the tree
	 */
	private static extractAreas(items: ILayoutItem[]): IComplexLayoutArea[] {
		const areas: IComplexLayoutArea[] = [];

		for (const item of items) {
			if (item.Type === 'area') {
				areas.push(item as IComplexLayoutArea);
			} else if (item.Type === 'container') {
				const container = item as ILayoutContainer;
				areas.push(...ComplexLayoutUtils.extractAreas(container.Children));
			}
		}

		return areas;
	}

	/**
	 * Builds a complex layout instance with nested containers and their associated fields.
	 * This method handles both input and output controllers and automatically extracts the necessary data.
	 * Recursively traverses container structure from backend to match fields with areas.
	 * @param field - The field controller (InputController or OutputController) containing complex layout configuration
	 * @param prebuiltFields - Optional pre-built nested fields (useful when fields are already computed, e.g., in ComplexInputController.views)
	 * @returns Complex layout instance with nested containers and area-to-field mappings
	 */
	static buildLayout(
		field: Field<IFieldMetadata<IComplexLayout>>,
		prebuiltFields?: NestedField[]
	): ComplexLayoutInstance {
		let fields = prebuiltFields ?? ComplexLayoutUtils.buildNestedFields(field);
		let containers = field.metadata.Component.Configuration.Containers ?? [];

		// Extract all areas from the container tree
		const allAreas = ComplexLayoutUtils.extractAreas(containers);

		// Build area instances dictionary
		let areaInstanceMap = new Map<string, ComplexLayoutAreaInstance>();

		for (let i = 0; i < fields.length; i++) {
			const fieldItem = fields[i];
			let areaName = fieldItem.metadata.CustomProperties?.ComplexLayoutItem?.Area ?? null;

			// Make sure key is not null.
			const key = areaName ?? '';

			if (!areaInstanceMap.has(key)) {
				let area = allAreas.find((t) => t.Name == areaName) ?? null;

				areaInstanceMap.set(key, {
					Area: area,
					Items: []
				});
			}

			const areaInstance = areaInstanceMap.get(key)!;

			// Apply FieldCssClass from area to field metadata
			if (areaInstance.Area?.FieldCssClass != null) {
				fieldItem.metadata.CssClass ??= '';
				fieldItem.metadata.CssClass += ' ' + areaInstance.Area.FieldCssClass;
			}

			areaInstance.Items.push(fieldItem);
		}

		return {
			Containers: containers,
			AreaInstances: areaInstanceMap
		};
	}
}
