import type { ComponentMetadata } from "./uimf";
import EventSource from './EventSource';
import uuid from "./uuid";
import type IUimfApp from "./UimfApp";
import type { FormController } from "./FormController";

export interface Deferrer {
    resolve: () => void;
    promise: Promise<any>;
};

export abstract class InputController<T> extends EventSource {
    /**
     * Gets unique identifier for this `InputController` instance.
     */
    public readonly id: string = uuid();

    /**
     * Gets input's underlying value. This field is intended for internal use
     * and does not necessarily represent the actual value that is will be returned
     * by `getValue` method.
     */
    public value: T | null;

    /**
     * Gets input field's metadata.
     */
    public readonly metadata: ComponentMetadata;

    /**
     * Gets form to which the field belongs. If the field is not rendered in a form
     * the value of this property may be `null`.
     */
    public readonly form: FormController | null;

    /**
     * Gets the app to which the field belongs.
     */
    public readonly app: IUimfApp;

    /**
     * Should be resolved by the component itself once it has been fully loaded
     * and is ready to be used.
     */
    public readonly ready: Deferrer | null;

    constructor(
        metadata: ComponentMetadata,
        form: FormController | null,
        defer: Deferrer,
        app: IUimfApp) {
        super();
        this.metadata = metadata;
        this.form = form;
        this.ready = defer;
        this.app = app;
        this.value = null;
    }

    /** 
     * Sets input value and fires "changed" event afterwards.
     * @param value Value to set. This value can either be the actual value
     * or its serialized representation.
     */
    public setValue(value: T | string | null): Promise<void> {
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
                this.value = value;
                promise = Promise.resolve();
            }
        }

        return promise
            .then(() => this.setValueInternal(this.value))
            .then(() => this.fire('input:change', this));
    }

    /** 
     * This method is called internally by `setValue` and is useful in case additional logic needs to be
     * applied when input's value is set.
     * @param value Input's new value.
     */
    protected setValueInternal(value: T | null): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Gets current value of this input field.
     */
    public abstract getValue(): Promise<T | null>;

    /**
     * Deserializes string into a valid value or null.
     */
    public abstract deserialize(value: string | null): Promise<T | null>;

    /**
     * Serializes given value.
     * @param value value to serialize.
     */
    public abstract serialize(value: T | null): string | null;

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