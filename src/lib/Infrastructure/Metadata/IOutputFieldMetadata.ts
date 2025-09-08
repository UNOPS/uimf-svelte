import type { IFieldMetadata } from "./IFieldMetadata";
import type { FieldLayout } from "./FieldLayout";

export interface IOutputFieldMetadata<TConfiguration = any> extends IFieldMetadata<TConfiguration> {
    HideIfNull: boolean;
}
