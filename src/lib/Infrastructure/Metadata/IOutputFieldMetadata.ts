import type { IFieldMetadata } from "./IFieldMetadata";

export interface IOutputFieldMetadata<TConfiguration = any> extends IFieldMetadata<TConfiguration> {
    HideIfNull: boolean;
}
