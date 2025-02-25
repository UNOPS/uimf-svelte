import { ITypeaheadValue } from "./ITypeaheadValue";

export interface IOption extends ITypeaheadValue {
	CssClass: string | null | undefined;
    Label: string;
    SearchText?: string | null;
    Description?: string | null;
    RequiredPermission?: string | null;
    Group?: string | null;
}

