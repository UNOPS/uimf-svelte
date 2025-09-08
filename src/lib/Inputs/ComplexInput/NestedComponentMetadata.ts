import type { IInputFieldMetadata } from "$lib/Infrastructure/Metadata/IInputFieldMetadata";

export interface NestedComponentMetadata {
	CssClassEach: string;
	CssClass: string;
	Fields: FieldItem[];
}

interface FieldItem {
	IsInput: boolean;
	Metadata: IInputFieldMetadata;
}
