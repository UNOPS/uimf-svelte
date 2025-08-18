import type { FormMetadata } from "./Metadata/FormMetadata";
import type { InputController } from "./InputController";
import type { OutputController } from "./OutputController";
import type { FormLink } from "./Metadata/FormLink";
import type IUimfApp from "./UimfApp";
import type { IFormContainer } from "./UimfApp";

export interface FormInstance extends IFormContainer {
    submit: (postOnLoad?: boolean) => Promise<any>;
    hasVisibleOutputs: boolean;
    hasVisibleInputs: boolean;
    load(postOnLoad: boolean): Promise<any>;
    on(event: string, callback: (args: any) => void): any;
    destroy(): any;
    fire(event: string, args?: { postOnLoad: any; }): any;
    metadata: FormMetadata;
    response: { [key: string]: OutputController<any>; };
    inputs: { [key: string]: InputController<any>; };
    originalInputValues: { [key: string]: any; };
    app: IUimfApp;
    currentUrl: string;
    useUrl: boolean;
    setInputFieldValues(formlink: FormLink): Promise<any>;
    getInputFieldValues(): Promise<{ [key: string]: any; }>;
    parentForm: IFormContainer | null;
    cancel: () => void | null;

    /**
     * DOM element holding this form instance.
     */
    element: HTMLElement | null;
}
