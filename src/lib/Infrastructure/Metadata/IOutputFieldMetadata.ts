import { IFieldMetadata } from "./IFieldMetadata";
import { FieldLayout } from "./FieldLayout";

export interface IOutputFieldMetadata<TConfiguration = any> extends IFieldMetadata<TConfiguration> {
    Layout?: FieldLayout | null;
    CssClass?: string | null;
    HideIfNull: boolean;
}
