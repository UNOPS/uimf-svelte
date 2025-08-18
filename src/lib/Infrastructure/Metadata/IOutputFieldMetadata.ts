import type { IFieldMetadata } from "./IFieldMetadata";
import type { FieldLayout } from "./FieldLayout";

export interface IOutputFieldMetadata<TConfiguration = any> extends IFieldMetadata<TConfiguration> {
    Layout?: FieldLayout | null;
    CssClass?: string | null;
    HideIfNull: boolean;
}
