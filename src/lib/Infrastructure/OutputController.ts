import EventSource from "./EventSource";
import { FormController } from "./FormController";
import type IUimfApp from "./UimfApp";
import type { ComponentMetadata } from "./uimf";
import uuid from "./uuid";

export interface CreateOutputOptions<TMetadata extends ComponentMetadata = ComponentMetadata> {
    metadata: TMetadata;
    data: any;
    form: FormController | null;
    app: IUimfApp;
}

/**
 * Controller for an output field. Each output field in a form will have `OutputController assigned to it
 * so that output fields can be managed via a consistent API.
 */
export class OutputController<T, TMetadata extends ComponentMetadata = ComponentMetadata> extends EventSource {
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

    constructor(options: CreateOutputOptions<TMetadata>) {
        super();
        this.metadata = options.metadata as TMetadata;
        this.value = options.data;
        this.app = options.app;
        this.form = options.form != null ? new FormController(options.form?.parentForm ?? null, options.form) : null;
    }

    public metadata: TMetadata;

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
