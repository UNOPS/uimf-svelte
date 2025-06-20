import type { IInputFieldMetadata } from '$lib/Infrastructure/uimf';

export interface NestedComponentMetadata {
	CssClassEach: string;
	CssClass: string;
	Fields: IInputFieldMetadata[];
}
