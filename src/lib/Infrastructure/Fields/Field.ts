import EventSource from "../EventSource";
import type { FormInstance } from "../FormInstance";
import type IUimfApp from "../UimfApp";
import type UimfApp from "../UimfApp";
import uuid from "../uuid";

export abstract class Field extends EventSource {
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
    public readonly app: IUimfApp | null;

    /**
     * Gets nested fields owned by this field.
     */
    readonly children: Record<string, Field>;

    /**
     * Gets parent field under which this field is nested.
     */
    readonly parent: Field | null;

    constructor(options: {
        form: FormInstance | null,
        children: Record<string, Field>,
        parent: Field | null,
        app: UimfApp | null
    }) {
        super();

        this.app = options.app ?? options.form?.app ?? null;
        this.form = options.form;
        this.parent = options.parent;
        this.children = options.children;
    }
}