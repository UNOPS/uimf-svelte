import type { FormLinkData } from "$lib/Outputs/FormLink.svelte";
import type { FormInstance } from "./FormController";
import type { IFieldMetadata, FormMetadata } from "./uimf";

interface FormLink {
    Form: string;
    InputFieldValues?: any;
    Label?: string;
}

export interface FormResponse extends Response {
    FileData?: {
        Filename: string;
        ContentType: string;
        Data: string;
    };
    Metadata: any;
}

interface IConfirmOptions {
    headerText?: string;
    bodyText: string;
    actionButtonText?: string;
    closeButtonText?: string;
}

interface IAlertOptions {
    headerText?: string;
    bodyText: string;
    actions?: FormLink[] | null;
    afterExceptionAction?: () => void;
    size?: string;
}

interface IModalOptions {
    form: string;
    inputFieldValues?: any;
    closeOnResponseHandled?: boolean;
    init?: (form: FormInstance, modal: { $close: () => void }) => void;
    parentForm?: FormInstance | null;
}

interface IHtmlModalOptions {
    templateUrl: string;
    controller?: any;
    data?: any;
    size?: string;
    windowClass?: string;
}

interface ColorOptions {
    format: string;
    hue?: string;
    alpha: number;
    luminosity: string;
}

interface IAppStorage{
    isStored(key:string, value: any): boolean;
	hasItems(key: string) : boolean;
	getValue(key: string, value: any) : any;
	update(key: string, values: number[]): void;
	removeValue(key: string, index: number) : void;
	addValue(key: string, value: any) : void;
	setListener(key: string, callback: (event?: Event) => void): void;
	removeListener(): void;
}

export default interface IUimfApp {
    appStorage: IAppStorage;
	showFormInSection(formId: string, inputFieldValues: any, sectionId: string): void;
    renderForm(options: { data: any, metadata: IFieldMetadata, form: FormInstance | null }): Element;
    runResponseHandler(response: FormResponse): Promise<void>;
    runClientFunctions(response: FormResponse, parentForm?: FormInstance | null): Promise<void>;
    handleCustomFormLinkAction(value: FormLinkData): void;
    confirm(options: IConfirmOptions): Promise<void>;
    alert(options: IAlertOptions): Promise<void>;
    openModal(options: IModalOptions): Promise<void>;
    openHtmlModal(options: IHtmlModalOptions): Promise<void>;
    formsById: { [id: string]: FormMetadata };
    makeUrl(link: FormLink): Promise<string>;
    goto(link: FormLink): Promise<void>;
    postForm<T extends FormResponse>(form: string, data: any, config: any): Promise<T>;
    getApiFile(url: string): Promise<Response>;
    getApi(form: string): Promise<Response>;
    getResponseHandler(handler: string): any;
    getForm(formId: string): Promise<FormInstance>;
    hasPermission(permission?: string | null): boolean;
    colorFromString(str: string, options?: ColorOptions | null): string;
    getDefaultValue(valueName: string): any;
}