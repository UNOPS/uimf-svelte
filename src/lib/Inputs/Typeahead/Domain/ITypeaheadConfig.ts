import type { ITypeaheadItem } from "./ITypeaheadItem";

export interface ITypeaheadConfig {
    DefaultValue?: string | null;
    Source?: string | null;
    Parameters?: Array<{
        SourceType: string;
        Parameter: string;
        Source: string;
    }> | null;
    Items?: Array<ITypeaheadItem>;
}