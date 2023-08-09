import type EventSource from "./EventSource";
import type { FormController } from "./FormController";
import type { InputController } from "./InputController";
import type { OutputController } from "./OutputController";

interface Options {
    init?: any;
    refresh?: any;
    initBrowser?: any;
    refreshBrowser?: any;
    destroy?: any;
};

class FieldComponentController<T extends EventSource & { id: string }> {
    public field!: T;
    private refreshOn: string;

    /**
     * Function to invoke when the `field` changes.
     * @returns promise that's resolved once the initialization has completed.
     */
    public init: () => Promise<void> = () => Promise.resolve();

    /**
     * Function to invoke when the `field` refreshes (i.e. - `refreshOn` event is emitted by `field`).
     * @returns promise that's resolved once the initialization has completed.
     */
    public refresh: () => Promise<void> = () => Promise.resolve();

    /**
     * Function to invoke just before the value of `field` is updated. This callback
     * allows to configure cleanup logic to be run to release resources. The passed
     * parameter is the previous value of `field` that is about to be replaced by a new
     * value.
     */
    public destroy: (field: T) => void;

    constructor(refreshOn: string, options: Options) {
        options = options || {};

        this.refreshOn = refreshOn;
        this.init = options.init || (() => Promise.resolve());
        this.refresh = options.refresh || (() => Promise.resolve());
        this.destroy = options.destroy || (() => { });
    }

    public async setup(field: T) {
        if (this.field?.id === field.id) {
            return;
        }

        if (this.field != null) {
            this.destroy(this.field);
        }

        this.field = field;

        await this.init();
        await this.refresh();

        this.field.on(this.refreshOn, async () => await this.refresh());
    }
}

export class InputComponentController extends FieldComponentController<InputController<any>>{
    constructor(options: Options) {
        super('input:change', options);
    }
}

export class OutputComponentController extends FieldComponentController<OutputController<any>>{
    constructor(options: Options) {
        super('output:change', options);
    }
}

export class FormComponentController extends FieldComponentController<FormController>{
    constructor(options: Options) {
        super('form:change', options);
    }
}