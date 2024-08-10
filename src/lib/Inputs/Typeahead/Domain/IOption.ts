import { ITypeaheadValue } from "./ITypeaheadValue";

export interface IOption extends ITypeaheadValue {
    Label: string;
    SearchText?: string | null;
    Description?: string | null;
    RequiredPermission?: string | null;
    Group?: string | null;
}

