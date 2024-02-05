import type { FormInstance } from "./FormController";
import type IUimfApp from "./UimfApp";
import type { ComponentMetadata } from "./uimf";

/**
 * Represents an input or an output component.
 */
export interface IFormComponent<TMetadata extends ComponentMetadata = ComponentMetadata> {
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