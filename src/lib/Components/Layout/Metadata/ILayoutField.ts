import type { IInputFieldMetadata } from '../../../Infrastructure/Metadata/IInputFieldMetadata';
import type { IOutputFieldMetadata } from '../../../Infrastructure/Metadata/IOutputFieldMetadata';

export interface ILayoutField {
	IsInput: boolean;
	Metadata: IInputFieldMetadata | IOutputFieldMetadata;
}
