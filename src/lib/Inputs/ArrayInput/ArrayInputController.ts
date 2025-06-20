import { InputController, type CreateInputOptions } from '../../Infrastructure/InputController';
import type { IInputFieldMetadata } from '../../Infrastructure/uimf';
import type { IArrayInputData } from './IArrayInputData';

export class ArrayInputController extends InputController<IArrayInputData, IInputFieldMetadata> {
	constructor(options: CreateInputOptions<IInputFieldMetadata>) {
		super(options);
	}

	public deserialize(value: string): Promise<IArrayInputData> {
		var result = JSON.parse(value);
		return Promise.resolve(result);
	}

	public serialize(value: IArrayInputData): string | null {
		return value != null && value.Items?.length > 0 ? JSON.stringify(value) : null;
	}

	public async getValue(): Promise<IArrayInputData> {
		return Promise.resolve(this.value ?? { Items: [] });
	}

	protected async setValueInternal(value: IArrayInputData | null): Promise<void> {
		// Make sure that `field.value.Items` has a non-null value.
		// This is important to ensure that the newly-added items
		// can be retrieved (and POSTed).
		this.value = {
			Items: value?.Items ?? []
		};
	}
}
