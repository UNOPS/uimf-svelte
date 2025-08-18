import type { FormInstance } from "./FormInstance";
import type IUimfApp from "./UimfApp";
import type { IFieldMetadata } from "./Metadata/IFieldMetadata";

/**
 * Represents an input or an output component.
 */
export interface IFormComponent<TMetadata extends IFieldMetadata = IFieldMetadata> {
    /**
     * Gets form to which the field belongs. If the field is not rendered in a form
     * the value of this property may be `null`.
     */
    readonly form: FormInstance | null;

    /**
     * Gets the app to which the field belongs.
     */
    readonly app: IUimfApp;

    /**
     * Gets metadata for this input/output component.
     */
    readonly metadata: TMetadata;
}