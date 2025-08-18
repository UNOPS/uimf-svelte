import type { IInputFieldMetadata } from "$lib/Infrastructure/Metadata/IInputFieldMetadata";

export interface NestedComponentMetadata {
	CssClassEach: string;
	CssClass: string;
	Fields: IInputFieldMetadata[];
}
