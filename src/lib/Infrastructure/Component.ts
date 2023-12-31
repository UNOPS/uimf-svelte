import type EventSource from "./EventSource";
import type { InputController } from "./InputController";
import type { OutputController } from "./OutputController";

interface Options {
    init?: any;
    refresh?: any;
    destroy?: any;
};

class Component<T extends EventSource & { id: string }> {
    public field!: T;
    protected refreshOn: string;

    /**
     * Function to invoke when the `field` changes (i.e. - another field is assigned).
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

        // It's important to subscribe to the refresh event before calling the init,
        // because the init might trigger a refresh which we want to handle.
        this.field.on(this.refreshOn, async () => await this.refresh());

        this.customSetup();
    }

    public customSetup: () => void = () => { return };
}

export class InputComponent extends Component<InputController<any>>{

    public value: any;

    constructor(options: Options) {
        super('input:change', options);
    }
}

export class OutputComponent extends Component<OutputController<any>>{
    constructor(options: Options) {
        super('output:change', options);
    }
}