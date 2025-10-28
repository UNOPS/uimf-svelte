import type { FormInstance } from "./FormInstance";
import type UimfApp from "./App/UimfApp";
import type { IOutputFieldMetadata } from "./Metadata/IOutputFieldMetadata";
import type { IComponent } from "./Metadata/IComponent";
import { Field } from "./Fields/Field";
import { OutputFieldMetadataFactory } from "./Utilities/OutputFieldMetadataFactory";

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
    app: UimfApp;
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

    public readonly type: string = "input";

    /**
     * Value of the output field.
     */
    public value: TValue;

    /**
     * Sets output field's value.
     * @param data New value for the output field.
     */
    public override setValue(data: TValue): Promise<void> {
        this.value = data;

        this.fire("output:change", this);

        return Promise.resolve();
    }

    public getValue(): Promise<any> {
        return Promise.resolve(this.value);
    }

    /**
     * Creates a nested output controller with the current controller as parent.
     * @param component The component configuration for the nested output.
     * @param data The data for the nested output.
     * @param options Optional configuration (e.g., Id).
     */
    public createNestedOutput<TConfig = null>(
        component: IComponent<TConfig>,
        data: any,
        options?: { Id?: string }
    ): OutputController<any> {
        return new OutputController<any>({
            metadata: OutputFieldMetadataFactory.fromComponent(component, options),
            data: data,
            form: this.form,
            app: this.app,
            parent: this
        });
    }
}
