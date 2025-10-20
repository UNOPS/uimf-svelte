import { InputController, type CreateInputOptions } from '../../Infrastructure/InputController';
import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
import type { IInputFieldMetadata } from "../../Infrastructure/Metadata/IInputFieldMetadata";
import type { ViewData } from './ViewData';
import { IOutputFieldMetadata } from '../../Infrastructure/Metadata';
import { OutputController } from '../../Infrastructure/OutputController';
import { IComplexLayoutMetadata } from './ComplexInput.svelte';

export class ComplexInputController extends InputController<
	ViewData,
	IInputFieldMetadata<IComplexLayoutMetadata>
> {
	declare views: Array<{
		isInput: boolean;
		metadata: IInputFieldMetadata | IOutputFieldMetadata;
		controller: InputController<any> | OutputController<any>;
	}>;

	constructor(options: CreateInputOptions<IInputFieldMetadata<IComplexLayoutMetadata>>) {
		super(options);

		this.views = [];

		this.metadata.Component.Configuration.Fields.sort((x, y) => x.Metadata.OrderIndex - y.Metadata.OrderIndex);

		for (const view of this.metadata.Component.Configuration.Fields) {
			let controllerClass = view.IsInput
				? controlRegister.inputs[view.Metadata.Component.Type].controller
				: null;

			this.views.push({
				isInput: view.IsInput,
				metadata: view.Metadata,
				controller: view.IsInput ? new controllerClass!({
					parent: this,
					metadata: view.Metadata,
					form: this.form,
					app: this.app
				}) : new OutputController<any>({
					app: this.app,
					parent: this,
					metadata: view.Metadata as unknown as IOutputFieldMetadata,
					form: this.form,
					data: null
				})
			});
		}
	}

	public getValue(): Promise<ViewData | null> {
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
