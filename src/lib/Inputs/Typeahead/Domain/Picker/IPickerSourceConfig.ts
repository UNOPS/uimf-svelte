export interface IPickerSourceConfig<T = any> {
    Source?: string | null;
    Parameters?: Array<{
        SourceType: string;
        Parameter: string;
        Source: string;
    }> | null;
    Items?: Array<T>;
}
