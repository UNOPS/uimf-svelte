import { InputController, type CreateInputOptions } from '../../Infrastructure/InputController';
import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
import type { IInputFieldMetadata } from "$lib/Infrastructure/Metadata/IInputFieldMetadata";
import type { ViewData } from './ViewData';
import type { NestedComponentMetadata } from './NestedComponentMetadata';

export class ComplexInputController extends InputController<
	ViewData,
	IInputFieldMetadata<NestedComponentMetadata>
> {
	declare views: Array<{
		metadata: IInputFieldMetadata;
		controller: InputController<any>;
	}>;

	constructor(options: CreateInputOptions<IInputFieldMetadata<NestedComponentMetadata>>) {
		super(options);

		this.views = [];

		this.metadata.Component.Configuration.Fields.sort((x, y) => x.OrderIndex - y.OrderIndex);

		for (const view of this.metadata.Component.Configuration.Fields) {
			let controllerClass = controlRegister.inputs[view.Component.Type].controller;

			this.views.push({
				metadata: view,
				controller: new controllerClass({
					metadata: view,
					form: this.form,
					app: this.app
				})
			});
		}
	}

	public getValue(): Promise<ViewData | null> {
		let effectiveValue: { [x: string]: any } = {};

		let allRequiredInputsHaveValues = true;

		let promises = this.views.map(function (view) {
			return view.controller.getValue().then(function (value: any) {
				if (value == null && view.metadata.Required) {
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

	public deserialize(value: string | null): Promise<ViewData | null> {
		const parsed = value != null && value.trim().length > 0 ? JSON.parse(value) : null;

		return Promise.resolve(parsed);
	}

	public serialize(value: ViewData | null): string | null {
		if (value == null) {
			return null;
		}

		return JSON.stringify(value);
	}

	protected setValueInternal(value: ViewData | null): Promise<void> {
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
