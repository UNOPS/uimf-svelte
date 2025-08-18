import type { IFieldMetadata } from "./IFieldMetadata";
import type { FieldLayout } from "./FieldLayout";
import type { DocumentationLayout } from "./DocumentationLayout";

export interface IInputFieldMetadata<TConfiguration = any> extends IFieldMetadata<TConfiguration> {
    CssClass?: string | null;
    Layout?: FieldLayout | null;
    DocumentationLayout?: DocumentationLayout | null;
    Required: boolean;
}
