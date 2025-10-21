import type { IFieldMetadata, IInputFieldMetadata, IOutputFieldMetadata } from '../../Infrastructure/Metadata';
import type {
	IComplexLayout,
	NestedField,
	ComplexLayoutAreaInstance,
	ComplexLayoutInstance,
	IComplexOutputFieldMetadata
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
	 * Builds a complex layout instance with areas and their associated fields from a field controller, sorted by OrderIndex.
	 * This method handles both input and output controllers and automatically extracts the necessary data.
	 * @param field - The field controller (InputController or OutputController) containing complex layout configuration
	 * @param prebuiltFields - Optional pre-built nested fields (useful when fields are already computed, e.g., in ComplexInputController.views)
	 * @returns Complex layout instance with sorted areas and their fields with applied CSS classes
	 */
	static buildLayout(
		field: Field<IFieldMetadata<IComplexLayout>>,
		prebuiltFields?: NestedField[]
	): ComplexLayoutInstance {
		let fields = prebuiltFields ?? ComplexLayoutUtils.buildNestedFields(field);
		let areas = field.metadata.Component.Configuration.Areas;

		let areaDictionary: Record<string, ComplexLayoutAreaInstance> = {};

		for (let i = 0; i < fields.length; i++) {
			const field = fields[i];
			let areaName = field.metadata.CustomProperties?.ComplexLayoutItem?.Area ?? null;

			// Make sure key is not null.
			const key = areaName ?? '';

			if (!areaDictionary[key]) {
				let area = areas?.find((t) => t.Name == areaName) ?? null;

				areaDictionary[key] = {
					Area: area,
					Items: []
				};
			}

			const area = areaDictionary[key];

			if (area.Area?.FieldCssClass != null) {
				field.metadata.CssClass ??= '';
				field.metadata.CssClass += ' ' + area.Area.FieldCssClass;
			}

			areaDictionary[key].Items.push(field);
		}

		// Sort `results` entries by `Area.OrderIndex` and put in array.
		return {
			Areas: Object.entries(areaDictionary)
				.map(([_, value]) => value)
				.sort((a, b) => (a.Area?.OrderIndex ?? 0) - (b.Area?.OrderIndex ?? 0))
		};
	}
}
