import { IFieldMetadata } from "./IFieldMetadata";
import { FieldLayout } from "./FieldLayout";
import { DocumentationLayout } from "./DocumentationLayout";

export interface IInputFieldMetadata<TConfiguration = any> extends IFieldMetadata<TConfiguration> {
    CssClass?: string | null;
    Layout?: FieldLayout | null;
    DocumentationLayout?: DocumentationLayout | null;
    Required: boolean;
}
