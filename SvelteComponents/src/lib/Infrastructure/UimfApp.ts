import type { FormInstance } from "./FormController";

interface FormLink {
    Form: string;
    InputFieldValues: any;
};

interface FormResponse extends Response {
    Metadata: any;
}

export default interface IUimfApp {
    makeUrl(link: FormLink): string;
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