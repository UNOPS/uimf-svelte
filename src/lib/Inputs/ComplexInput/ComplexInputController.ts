import { InputController, type CreateInputOptions } from '../../Infrastructure/InputController';
import type { IInputFieldMetadata } from "../../Infrastructure/Metadata/IInputFieldMetadata";
import type { ILayout } from '../../Components/Layout/Metadata/ILayout';
import type { LayoutViewData, LayoutFieldInstance } from '../../Components/Layout/Layout.svelte';
import { LayoutUtils } from '../../Components/Layout/LayoutUtils';

export class ComplexInputController extends InputController<
	LayoutViewData,
	IInputFieldMetadata<ILayout>
> {
	declare views: Array<LayoutFieldInstance>;

	constructor(options: CreateInputOptions<IInputFieldMetadata<ILayout>>) {
		super(options);

		this.views = LayoutUtils.buildLayoutFields(this);
	}

	public getValue(): Promise<LayoutViewData | null> {
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

	public deserialize(value: string | null): Promise<LayoutViewData | null> {
		const parsed = value != null && value.trim().length > 0 ? JSON.parse(value) : null;

		return Promise.resolve(parsed);
	}

	public serialize(value: LayoutViewData | null): string | null {
		if (value == null) {
			return null;
		}

		return JSON.stringify(value);
	}

	protected setValueInternal(value: LayoutViewData | null): Promise<void> {
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
