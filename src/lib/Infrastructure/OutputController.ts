import type { FormInstance } from "./FormInstance";
import type IUimfApp from "./UimfApp";
import type { IOutputFieldMetadata } from "./Metadata/IOutputFieldMetadata";
import { Field } from "./Fields/Field";

export interface CreateOutputOptions<TMetadata extends IOutputFieldMetadata = IOutputFieldMetadata> {
    props: OutputComponentProps<TMetadata>;
    wrap?: {
        nolayout?: boolean;
    }
}

export interface OutputComponentProps<TMetadata extends IOutputFieldMetadata = IOutputFieldMetadata> {
    parent: Field | null;
    metadata: TMetadata;
    data: any;
    form: FormInstance | null;
    app: IUimfApp;
}

/**
 * Controller for an output field. Each output field in a form will have `OutputController assigned to it
 * so that output fields can be managed via a consistent API.
 */
export class OutputController<TValue, TMetadata extends IOutputFieldMetadata = IOutputFieldMetadata> extends Field<TMetadata> {
    constructor(options: OutputComponentProps<TMetadata>) {
        super({
            form: options.form ?? null,
            parent: options.parent ?? null,
            children: {},
            app: options.app,
            metadata: options.metadata
        });

        this.metadata = options.metadata as TMetadata;
        this.value = options.data ?? null;
    }

    public metadata: TMetadata;

    /**
     * Value of the output field.
     */
    public value: TValue;

    /**
     * Sets output field's value.
     * @param data New value for the output field.
     */
    public setValue(data: TValue) {
        this.value = data;

        this.fire("output:change", this);
    }
}
