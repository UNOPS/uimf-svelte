import type { IFormLinkData } from "$lib/Outputs/FormLink/FormLink.svelte";
import type AppStorage from "../Storage/App/AppStorage";
import type { FormInstance } from "../FormInstance";
import type { IFieldMetadata } from "../Metadata/IFieldMetadata";
import type { FormMetadata } from "../Metadata/FormMetadata";
import { FormResponse } from "./FormResponse";
import { IFormContainer } from "./IFormContainer";
import { FormLink } from "../Metadata";

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
    parentForm?: IFormContainer | null;
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

interface IPostFormConfig {
    afterExceptionAction?: () => void;
    skipClientFunctions?: boolean;
}

export default interface IUimfApp {
    appStorage: AppStorage;
    showFormInSection(formId: string, inputFieldValues: any, sectionId: string, visibleOnlyTo?: string[]): void;
    renderForm(options: { data: any, metadata: IFieldMetadata, form: FormInstance | null }): Element;
    runResponseHandler(response: FormResponse): Promise<void>;
    runClientFunctions(response: FormResponse, parentForm?: FormInstance | null): Promise<void>;
    handleCustomFormLinkAction(value: IFormLinkData, inputFieldValues: any): void;
    confirm(options: IConfirmOptions): Promise<void>;
    alert(options: IAlertOptions): Promise<void>;
    openModal(options: IModalOptions): Promise<void>;
    openHtmlModal(options: IHtmlModalOptions): Promise<void>;
    formsById: { [id: string]: FormMetadata };
    makeUrl(link: FormLink): Promise<string>;
    goto(link: FormLink): Promise<void>;
    postForm<T extends FormResponse>(form: string, data: any, config: IPostFormConfig | null): Promise<T>;
    getApiFile(url: string): Promise<Response>;
    getApi(form: string): Promise<Response>;
    getResponseHandler(handler: string): any;
    getForm(formId: string): Promise<FormInstance>;
    hasPermission(permission?: string | null): boolean;
    colorFromString(str: string, options?: ColorOptions | null): string;
    getDefaultValue(valueName: string): any;
}