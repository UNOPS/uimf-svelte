import type { InputController } from "./InputController";
import { OutputController } from "./OutputController";
import type IUimfApp from "./UimfApp";
import type { IFieldMetadata, FormLink, IInputFieldMetadata, IOutputFieldMetadata } from "./uimf";

interface FormMetadata extends IFieldMetadata {
    InputFields: IInputFieldMetadata[];
    PostOnLoad: any;
    OutputFields: IOutputFieldMetadata[];
    CloseOnPostIfModal: boolean;
    PostOnLoadValidation: boolean;
    Documentation?: string | null;
}

export interface FormInstance {
    submit: (postOnLoad?: boolean) => Promise<any>;
    hasVisibleOutputs: boolean;
    hasVisibleInputs: boolean;
    load(postOnLoad: boolean): Promise<any>;
    on(event: string, callback: (args: any) => void): any;
    destroy(): any;
    fire(event: string, args?: { postOnLoad: any; }): any;
    metadata: FormMetadata;
    response: { [key: string]: OutputController<any> };
    inputs: { [key: string]: InputController<any> };
    originalInputValues: { [key: string]: any };
    app: IUimfApp;
    currentUrl: string;
    useUrl: boolean;
    setInputFieldValues(formlink: FormLink): Promise<any>;
    getInputFieldValues(): Promise<{ [key: string]: any; }>;
    parentForm: FormInstance | null;
    cancel: () => void | null;
}