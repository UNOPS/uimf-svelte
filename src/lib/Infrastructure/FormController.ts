import { defaultControlRegister } from "./ControlRegister";
import EventSource from "./EventSource";
import type { Deferrer, InputController } from "./InputController";
import { OutputController } from "./OutputController";
import type IUimfApp from "./UimfApp";
import type { ComponentMetadata, FormLink } from "./uimf";
import uuid from "./uuid";

interface FormMetadata extends ComponentMetadata {
    InputFields: ComponentMetadata[];
    PostOnLoad: any;
    OutputFields: ComponentMetadata[];
    CloseOnPostIfModal: boolean;
    PostOnLoadValidation: boolean;
}

export interface FormInstance {
    submit: (postOnLoad?: boolean) => Promise<any>;
    hasVisibleOutputs: boolean;
    hasVisibleInputs: boolean;
    load(postOnLoad: boolean): Promise<any>;
    on(event: string, callback: (args: any) => void): any;
    destroy(): any;
    fire(event: string, args: { postOnLoad: any; }): any;
    metadata: FormMetadata;
    response: { [key: string]: any };
    inputs: { [key: string]: any };
    originalInputValues: { [key: string]: any };
    app: IUimfApp;
    hasOriginalInputValues: () => boolean;
    currentUrl: string;
    useUrl: boolean;
    setInputFieldValues(formlink: FormLink): Promise<any>;
}

type Dictionary<T> = { [key: string]: T; }

export class FormController extends EventSource implements FormInstance {
    /**
 * Gets unique identifier for this `InputController` instance.
 */
    public readonly id: string = uuid();
    public parentForm: FormController | null;
    public hasVisibleOutputs: boolean;
    public hasVisibleInputs: boolean;
    public metadata: FormMetadata;
    public response: Dictionary<any>;
    public inputs: Dictionary<{ value: any, serialize: (value: any) => string, getValue: () => Promise<any> }>;
    public originalInputValues: Dictionary<any>;
    public currentUrl: string;
    public breadcrumbs: OutputController<FormLink>[] = [];
    inputControllers: { [x: string]: InputController<any> } = {};
    outputControllers: { [x: string]: OutputController<any> } = {};
    public title = '';
    private outputSlots: { [x: string]: OutputController<any>[] } = {
        'top': [],
        'above-inputs': [],
        'below-inputs': []
    };
    public hasResponse = false;
    public readonly app: IUimfApp;
    public useUrl: boolean;
    public onFormLoaded: ((arg0: any) => any) | null = null;
    public onFormFailed: ((arg0: any) => any) | null = null;
    submit: (postOnLoad?: boolean | undefined) => Promise<any>;

    setInputFieldValues(formlink: FormLink) {
        throw new Error("Method not implemented.");
        return Promise.reject();
    }

    constructor(parentForm: FormController | null, form: FormInstance) {
        super();
        this.parentForm = parentForm;
        this.useUrl = form.useUrl;
        this.metadata = form.metadata;
        this.response = form.response;
        this.inputs = form.inputs;

        this.submit = function (postOnLoad?: boolean) {
            return form.submit(postOnLoad);
        };

        this.hasVisibleInputs = form.hasVisibleInputs;
        this.hasVisibleOutputs = form.hasVisibleOutputs;
        this.originalInputValues = form.originalInputValues;
        this.currentUrl = form.currentUrl;
        this.app = form.app;
        this.id = form.metadata.Id;
    }

    public getTopOutputControllers() {
        return this.outputSlots['top'];
    }

    public getAboveInputsOutputControllers() {
        return this.outputSlots['above-inputs'];
    }

    public getBelowInputsOutputControllers() {
        return this.outputSlots['below-inputs'];
    }

    public getInputControllers() {
        return Object.values(this.inputControllers).sort((x, y) => x.metadata.OrderIndex - y.metadata.OrderIndex);
    }

    public hasOriginalInputValues() {
        return Object.values(this.originalInputValues).filter(v => v !== null).length === 0;
    };

    public load(): Promise<any> {
        // const listenToLocationChange = () => {
        //     var unsubscribe = $rootScope.$on('$locationChangeSuccess',
        //          () => {
        //             var newUrl = location.hash;

        //             // Remove the "/#" in the string start.
        //             newUrl = newUrl.replace(/^\/?\#+/g, '');

        //             // Extract form id from the new URL.
        //             var urlParts = newUrl.split('/');
        //             var formId = urlParts.length > 2 ? urlParts[2].split('?')[0] : null;

        //             // Resubmit form if the URL has changed.
        //             if (self.metadata.Id === formId && newUrl !== self._currentUrl) {
        //                 self._setInputsBasedOnUrl().then(function () {
        //                     self.submit();
        //                 });
        //             } else if (self.metadata.Id !== formId) {
        //                 // If browser has moved on to another form, then we destroy this form.
        //                 // We need explicit call to `destroy`, because there is a bug somewhere
        //                 // (either in angular or elsewhere), which results in "URL flicker"
        //                 // (user is redirected from `form/old?p1=v1` to `form/old` before being 
        //                 // redirected to`form/new`). This in turn breaks the "back" button in browser.
        //                 // To avoid all this trouble, we destroy the form before it can do damage.
        //                 this.destroy();
        //             }
        //         });

        //     self.on('destroy',
        //         function () {
        //             unsubscribe();
        //         });
        // }

        // if (self.useUrl) {
        //     listenToLocationChange();
        // }

        return this.metadata.PostOnLoad ? this.submit(true) : Promise.resolve(this)
            .catch(function (reason: string) {
                if (reason === 'validation') {
                    return Promise.resolve(self);
                }

                return Promise.reject(reason);
            });
    }

    public destroy() {
        this.fire('destroy', this);
    }


    async clearInput() {
        let controlleArray = Object.values(this.inputControllers);
        for (const controller of controlleArray) {
            await controller.setValue(null);
        }

    }

    public async init() {
        this.getParamValueFromUrl();

        for (const outputMetadata of this.metadata.OutputFields) {
            this.outputControllers[outputMetadata.Id] = this.makeOutputController(outputMetadata, this.response[outputMetadata.Id].value);
        }

        Object.keys(this.outputControllers).forEach((key: string) => {
            let outputField = this.outputControllers[key];
            if (outputField.metadata.Hidden === true) {
                return;
            }

            if (outputField.metadata.OrderIndex < -100) {
                this.outputSlots['top'].push(outputField);
            } else if (outputField.metadata.OrderIndex < 0) {
                this.outputSlots['above-inputs'].push(outputField);
            } else {
                this.outputSlots['below-inputs'].push(outputField);
            }
        });

        this.outputSlots['top'].sort((x, y) => x.metadata.OrderIndex - y.metadata.OrderIndex);
        this.outputSlots['above-inputs'].sort((x, y) => x.metadata.OrderIndex - y.metadata.OrderIndex);
        this.outputSlots['below-inputs'].sort((x, y) => x.metadata.OrderIndex - y.metadata.OrderIndex);

        this.on('form:responseHandled', () => {
            this.updatePageTitle();
            this.hasResponse = true;
        });

        this
            .load()
            .then(async () => {
                if (this.response.Metadata?.Breadcrumbs != null) {
                    for (let i = 0; i < this.response.Metadata.Breadcrumbs.length; ++i) {
                        let breadcrumb = this.response.Metadata.Breadcrumbs[i];
                        let breadcrumbMetadata = {
                            Id: `breadcrumb-${i}`,
                            Type: 'formlink',
                            Label: 'test',
                            Required: false,
                            Hidden: false,
                            CustomProperties: null,
                            OrderIndex: 0
                        }
                        this.breadcrumbs.push(this.makeOutputController(breadcrumbMetadata, breadcrumb));
                    }
                }

                for (const inputKey of Object.keys(this.response)) {
                    if (this.inputs[inputKey] != null) {
                        this.inputs[inputKey] = {
                            value: this.response[inputKey] ?? this.inputs[inputKey].value
                        };
                    }
                }

                for (const inputMetadata of this.metadata.InputFields) {
                    if (!inputMetadata.Hidden) {
                        this.inputControllers[inputMetadata.Id] = await this.makeInputController(inputMetadata, this.inputs[inputMetadata.Id].value);
                    }
                }

                this.fire("form:change", this);

                this.updatePageTitle();
                this.onFormLoaded?.({ $form: this });
            })
            .catch(() => {
                this.onFormFailed?.({ $form: this });
            });

    }

    /**
     * Gets input field values.
     * @param data 
     */
    public async getInputFieldValues(): Promise<{ [key: string]: any; }> {
        var data: { [key: string]: any } = {};

        var promises = this.metadata.InputFields.map(async inputFieldMetadata => {
            data[inputFieldMetadata.Id] = await this.inputs[inputFieldMetadata.Id].getValue();
        });

        await Promise.all(promises);

        return data;
    }

    async makeInputController(metadata: ComponentMetadata, value: any): Promise<InputController<any>> {
        let controllerClass = defaultControlRegister.inputs[metadata.Type].controller;
        let deferer = {
            resolve: () => {
                return;
            },
            promise: Promise.resolve()
        } as Deferrer;

        let controllerToReturn = new controllerClass({
            metadata: metadata,
            form: this,
            defer: deferer,
            app: this.app
        });

        await controllerToReturn.setValue(value);
        return Promise.resolve(controllerToReturn);
    };

    makeOutputController(metadata: ComponentMetadata, value: any): OutputController<any> {
        let controllerToReturn = new OutputController<any>({
            metadata: metadata,
            data: value,
            form: this,
            app: this.app
        });
        return controllerToReturn;
    }

    getParamValueFromUrl() {
        let searchString = this.currentUrl?.split('?');
        if (!searchString || searchString.length < 2) {
            return;
        }

        let searchParams = new URLSearchParams('?' + searchString[1]);

        Object.keys(this.inputs).forEach((key) => {
            this.inputs[key].value = searchParams.get(key) ?? this.inputs[key].value;
        });
    };

    updatePageTitle() {
        this.title = this.response.Metadata?.Title || this.metadata.Label || this.metadata.Id;
        if (this.useUrl === true) {
            document.title = this.title;
        }
    };
}