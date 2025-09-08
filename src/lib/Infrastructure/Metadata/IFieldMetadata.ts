import { DocumentationLayout } from "./DocumentationLayout";
import { FieldLayout } from "./FieldLayout";
import type { IComponent } from "./IComponent";

export interface IFieldMetadata<TConfiguration = any> {
    Id: string;
    Hidden: boolean;
    CustomProperties?: any | null;
    Label: string;
    OrderIndex: number;
    Component: IComponent<TConfiguration>;
    DefaultValue?: string | null;
    Documentation: string | null;
    CssClass?: string | null;
    Layout?: FieldLayout | null;
    DocumentationLayout: DocumentationLayout | null;
}
