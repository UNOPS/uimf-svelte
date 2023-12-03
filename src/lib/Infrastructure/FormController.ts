import type IUimfApp from "./UimfApp";
import type { ComponentMetadata, FormLink } from "./uimf";

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
    getInputFieldValues(): Promise<{ [key: string]: any; }>;
    parentForm: FormInstance | null;
}