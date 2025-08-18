import EventSource from "../EventSource";
import type { FormInstance } from "../FormInstance";
import type { IFieldMetadata } from "../Metadata";
import type IUimfApp from "../App/UimfApp";
import type UimfApp from "../App/UimfApp";
import uuid from "../Utilities/uuid";

export abstract class Field<TMetadata extends IFieldMetadata = IFieldMetadata> extends EventSource {
    /**
     * Gets unique identifier for this field instance.
     */
    public readonly id: string = uuid();

    /**
     * Gets form to which the field belongs. If the field is not rendered in a form
     * the value of this property may be `null`.
     */
    public readonly form: FormInstance | null;

    /**
     * Gets the app to which the field belongs.
     */
    public readonly app: IUimfApp;

    /**
     * Gets nested fields owned by this field.
     */
    readonly children: Record<string, Field>;

    /**
     * Gets parent field under which this field is nested.
     */
    readonly parent: Field | null;

    /**
     * Metadata describing this field.
     */
    public metadata: TMetadata;

    constructor(options: {
        form: FormInstance | null,
        children: Record<string, Field>,
        parent: Field | null,
        app: UimfApp,
        metadata: TMetadata
    }) {
        super();

        this.app = options.app;
        this.form = options.form;
        this.parent = options.parent;
        this.children = options.children;
        this.metadata = options.metadata;

        if (this.parent != null) {
            this.parent.children[options.metadata.Id] = this;
        }
    }
}