import EventSource from "./EventSource";
import type { FormController, FormInstance } from "./FormController";
import type IUimfApp from "./UimfApp";
import type { ComponentMetadata } from "./uimf";
import uuid from "./uuid";

/**
 * Controller for an output field. Each output field in a form will have `OutputController assigned to it
 * so that output fields can be managed via a consistent API.
 */
export class OutputController<T> extends EventSource {
    /**
     * Gets unique identifier for this `InputController` instance.
     */
    public readonly id: string = uuid();

    /**
     * Gets form to which the field belongs. If the field is not rendered in a form
     * the value of this property may be `null`.
     */
    public readonly form: FormController | null;

    /**
     * Gets the app to which the field belongs.
     */
    public readonly app: IUimfApp;

    constructor(
        metadata: ComponentMetadata,
        data: any,
        form: FormController | null,
        app: IUimfApp) {
        super();
        this.metadata = metadata;
        this.value = data;
        this.form = form;
        this.app = app;
    }

    public metadata: ComponentMetadata;

    /**
     * Value of the output field.
     */
    public value: T;

    /**
     * Sets output field's value.
     * @param data New value for the output field.
     */
    public setValue(data: T) {
        this.value = data;

        this.fire("output:change", this);
    }
}
