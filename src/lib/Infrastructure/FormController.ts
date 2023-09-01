import type FormLink from "$lib/Outputs/FormLink.svelte";
import { defaultControlRegister } from "./ControlRegister";
import EventSource from "./EventSource";
import type { Deferrer, InputController } from "./InputController";
import { OutputController } from "./OutputController";
import type IUimfApp from "./UimfApp";
import type { ComponentMetadata } from "./uimf";
import uuid from "./uuid";

interface FormMetadata extends ComponentMetadata {
    InputFields: ComponentMetadata[];
    PostOnLoad: any;
    OutputFields: ComponentMetadata[];
}

export interface FormInstance {
    hasVisibleOutputs: boolean;
    hasVisibleInputs: boolean;
    load(arg0: boolean): Promise<any>;
    on(arg0: string, arg1: () => void): any;
    destroy(): any;
    fire(arg0: string, arg1: { postOnLoad: any; }): any;
    metadata: FormMetadata;
    response: { [key: string]: any };
    inputs: { [key: string]: any };
    originalInputValues: { [key: string]: any };
    app: IUimfApp;
    hasOriginalInputValues: () => boolean;
    currentUrl: string;
    useUrl: boolean;
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

    constructor(parentForm: FormController | null, form: FormInstance) {
        super();
        this.parentForm = parentForm;
        this.useUrl = form.useUrl;
        this.metadata = form.metadata;
        this.response = form.response;
        this.inputs = form.inputs;
        this.hasVisibleInputs = form.hasVisibleInputs;
        this.hasVisibleOutputs = form.hasVisibleOutputs;
        this.originalInputValues = form.originalInputValues;
        this.currentUrl = form.currentUrl;
        this.app = form.app;
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

    public async submit(asPostOnLoad: boolean, inputFieldValues: any | null = null): Promise<void> {
        let allRequiredInputsHaveValue = true;
        let inputData: { [x: string]: any } = {};

        if (inputFieldValues != null) {
            inputData = inputFieldValues;
        }
        else {
            for (const inputKey of Object.keys(this.inputs)) {
                if (inputKey == "Operation" && this.response.NextOperation?.Value != null) {
                    inputData[inputKey] = this.response.NextOperation;
                }
                else if (this.inputControllers[inputKey] != null) {
                    let input = this.inputControllers[inputKey];
                    inputData[inputKey] = await input.getValue();
                    if (inputData[inputKey] == null) {
                        allRequiredInputsHaveValue = allRequiredInputsHaveValue && !input.metadata.Required;
                    }
                } else {
                    inputData[inputKey] = this.inputs[inputKey].value;
                }
            }

            if (!allRequiredInputsHaveValue) {
                return Promise.reject('validation');
            }
        }


        return this.app
            .postForm(this.metadata.Id, inputData, {
                afterExceptionAction: function () {
                    this.fire('form:exceptionHandled');
                }
            })
            .then((response: { [x: string]: any }) => {
                this.response = response;

                Object.keys(response).forEach((outputId) => {
                    if (this.outputControllers[outputId] != null) {
                        this.outputControllers[outputId].setValue(response[outputId]);
                    }
                });

                if (response.Metadata != null) {
                    let customHandler = this.app.getResponseHandler(response.Metadata.Handler);
                    if (customHandler != null) {
                        customHandler(response);
                    }
                }

                this.fire('form:responseHandled', { postOnLoad: asPostOnLoad });
                this.fire('form:change', this);
                return Promise.resolve();
            });
    };

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

    async makeInputController(metadata: ComponentMetadata, value: any): Promise<InputController<any>> {
        let controllerClass = defaultControlRegister.inputs[metadata.Type].controller;
        let deferer = {
            resolve: () => {
                return;
            },
            promise: Promise.resolve()
        } as Deferrer;

        let controllerToReturn = new controllerClass(metadata, this, deferer, this.app);
        await controllerToReturn.setValue(value);
        return Promise.resolve(controllerToReturn);
    };

    makeOutputController(metadata: ComponentMetadata, value: any): OutputController<any> {
        let controllerToReturn = new OutputController<any>(metadata, value, this, this.app);
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