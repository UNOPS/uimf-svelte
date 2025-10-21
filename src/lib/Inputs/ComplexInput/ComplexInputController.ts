import { InputController, type CreateInputOptions } from '../../Infrastructure/InputController';
import type { IInputFieldMetadata } from "../../Infrastructure/Metadata/IInputFieldMetadata";
import type { ComplexLayoutViewData, IComplexLayout, NestedField } from '../../Components/ComplexLayout/ComplexLayout.svelte';
import { ComplexLayoutUtils } from '../../Components/ComplexLayout/ComplexLayoutUtils';

export class ComplexInputController extends InputController<
	ComplexLayoutViewData,
	IInputFieldMetadata<IComplexLayout>
> {
	declare views: Array<NestedField>;

	constructor(options: CreateInputOptions<IInputFieldMetadata<IComplexLayout>>) {
		super(options);

		this.views = ComplexLayoutUtils.buildNestedFields(this);
	}

	public getValue(): Promise<ComplexLayoutViewData | null> {
		let effectiveValue: { [x: string]: any } = {};

		let allRequiredInputsHaveValues = true;

		let promises = this.views.filter(t => t.isInput).map(function (view) {
			return view.controller.getValue().then(function (value: any) {
				if (value == null && (view.metadata as IInputFieldMetadata).Required) {
					allRequiredInputsHaveValues = false;
				}

				effectiveValue[view.metadata.Id] = value;
			});
		});

		return Promise.all(promises).then(function () {
			if (allRequiredInputsHaveValues === false) {
				return null;
			}

			return effectiveValue;
		});
	}

	public deserialize(value: string | null): Promise<ComplexLayoutViewData | null> {
		const parsed = value != null && value.trim().length > 0 ? JSON.parse(value) : null;

		return Promise.resolve(parsed);
	}

	public serialize(value: ComplexLayoutViewData | null): string | null {
		if (value == null) {
			return null;
		}

		return JSON.stringify(value);
	}

	protected setValueInternal(value: ComplexLayoutViewData | null): Promise<void> {
		let promises = [];

		this.value = value ?? {};

		for (const view of this.views) {
			promises.push(view.controller.setValue(this.value[view.metadata.Id] ?? null));
		}

		return Promise.all(promises).then(() => {
			return Promise.resolve();
		});
	}
}
