import type { FormLinkData } from "$lib/Outputs/FormLink.svelte";
import type { FormInstance } from "./FormController";
import type { ComponentMetadata, FormMetadata } from "./uimf";

interface FormLink {
    Form: string;
    InputFieldValues?: any;
    Label?: string;
}

export interface FormResponse extends Response {
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
}

interface ColorOptions {
    format: string;
    hue?: string;
    alpha: number;
    luminosity: string;
}

export default interface IUimfApp {
    renderForm(options: { data: any, metadata: ComponentMetadata, form: FormInstance | null }): Element;
    runResponseHandler(response: FormResponse): Promise<void>;
    runClientFunctions(response: FormResponse): Promise<void>;
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
    hasRole(permission?: string): boolean;
    getResponseHandler(handler: string): any;
    getForm(formId: string): Promise<FormInstance>;
    hasPermission(permission: string): boolean;
    colorFromString(str: string, options: ColorOptions): string;
}