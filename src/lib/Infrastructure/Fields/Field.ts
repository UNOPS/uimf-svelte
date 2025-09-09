import EventSource from "../EventSource";
import type { FormInstance } from "../FormInstance";
import type { IFieldMetadata } from "../Metadata";
import type IUimfApp from "../App/UimfApp";
import type UimfApp from "../App/UimfApp";
import uuid from "../Utilities/uuid";
import { FormFieldNavigator } from "./FormFieldNavigator";

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

    /**
     * Indicates the type of field this is.
     */
    abstract readonly type: string;

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

    /**
     * Gets all fields belonging to the same exact object. In most cases this will get all 
     * form's inputs (`FormInstance.inputs`) or outputs (`FormInstance.response`), unless 
     * this field is "nested" inside another one (e.g. - `TableInput`).
     */
    public siblings(): Record<string, Field> {
        if (this.parent == null) {
            if (this.form == null) {
                return {};
            }

            if (this.type === 'input') {
                return this.form.inputs;
            }

            return this.form.response;
        }

        return this.parent.children;
    }

    /**
     * Finds a related field (i.e. - belonging to the same `FormInstance`) given the 
     * field's path.. Path can either be relative or absolute (where root is the form).
     * Some examples:
     * <ul>
     * <li>/response/Contact/FirstName</li>
     * <li>/request/Address/City</li>
     * <li>./ChildField or ChildField (identical)</li>
     * <li>../Sibling</li>
     * <li>../ - parent field</li>
     * </ul>
     */
    public getRelatedFieldByPath(path: string, throwIfNotFound: boolean = false): Field | null {
        let field = null;

        if (!this.form) {
            field = null;
        }
        else {
            field = FormFieldNavigator.resolveFieldPath(this, path);
        }

        if (throwIfNotFound && field == null) {
            throw new Error(`Cannot find field with path "${path}".`);
        }

        return field;
    }

    /**
     * Gets the current value of this field.
     */
    public abstract getValue(): Promise<any>;

    /**
     * Sets the value of this field.
     */
    public abstract setValue(value: any): Promise<void>;
}