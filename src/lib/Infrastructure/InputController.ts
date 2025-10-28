import type { IInputFieldMetadata } from "./Metadata/IInputFieldMetadata";
import type UimfApp from "./App/UimfApp";
import type { FormInstance } from "./FormInstance";
import { Field } from "./Fields/Field";

export interface Deferrer {
    resolve: () => void;
    promise: Promise<any>;
};

export interface CreateInputOptions<TMetadata extends IInputFieldMetadata = IInputFieldMetadata> {
    parent: Field | null;
    metadata: TMetadata;
    form: FormInstance | null;
    app: UimfApp;
}

export abstract class InputController<TValue, TMetadata extends IInputFieldMetadata = IInputFieldMetadata> extends Field<TMetadata> {
    /**
     * Gets input's underlying value. This field is intended for internal use
     * and does not necessarily represent the actual value that is will be returned
     * by `getValue` method.
     */
    public value: TValue | null;

    /**
     * Gets input field's metadata.
     */
    public readonly metadata: TMetadata;

    public readonly type: string = "input";

    constructor(options: CreateInputOptions<TMetadata>) {
        super({
            form: options.form ?? null,
            parent: options.parent ?? null,
            children: {},
            app: options.app,
            metadata: options.metadata
        });

        this.metadata = options.metadata;
        this.value = null;
    }

    /** 
     * Sets input value and fires "changed" event afterwards.
     * @param value Value to set. This value can either be the actual value
     * or its serialized representation.
     */
    public override setValue(value: TValue | string | null): Promise<void> {
        var promise = null;

        if (value == null) {
            this.value = null;
            promise = Promise.resolve();
        }
        else {
            if (typeof (value) === "string" || typeof (value) === "number") {
                promise = this.deserialize(value.toString()).then(t => this.value = t);
            }
            else {
                promise = this.deserialize(this.serialize(value)).then(t => this.value = t);
            }
        }

        return promise
            .then(() => this.setValueInternal(this.value))
            .then(() => this.fire('input:change', this))
            .catch((e) => console.error('Something went wrong.', e));
    }

    /** 
     * This method is called internally by `setValue` and is useful in case additional logic needs to be
     * applied when input's value is set.
     * @param value Input's new value.
     */
    protected setValueInternal(value: TValue | null): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Gets current value of this input field.
     */
    public abstract getValue(): Promise<TValue | null>;

    /**
     * Deserializes string into a valid value or null.
     */
    public abstract deserialize(value: string | null): Promise<TValue | null>;

    /**
     * Serializes given value.
     * @param value value to serialize.
     */
    public abstract serialize(value: TValue | null): string | null;

    /**
     * Gets current value and serializes it to string.
     * @returns promise that will be resolved to a string representing input's current value.
     */
    public getValueAsString(): Promise<string | null> {
        return this.getValue().then((t) => {
            return this.serialize(t);
        });
    }
}