import type { FormInstance } from "./FormController";
import type { FormMetadata } from "./uimf";

interface FormLink {
    Form: string;
    InputFieldValues: any;
};

interface FormResponse extends Response {
    Metadata: any;
}

export default interface IUimfApp {
    formsById: { [id: string]: FormMetadata };
    makeUrl(link: FormLink): Promise<string>;
    postForm(form: string, data: any, config: any): Promise<FormResponse>;
    openModal(formData: any): any;
    uibOpenModal(formData: any): any;
    getApiFile(url: string): Promise<Response>;
    getApi(form: string): Promise<Response>;
    hasRole(permission: string): boolean;
    getResponseHandler(handler: string): any;
    getForm(formId: string): Promise<FormInstance>;
    formTools: any;
    pdfFactory: any;
    pdfMake: any;
};