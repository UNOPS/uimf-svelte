import type { IFormLinkData } from '../../Outputs/FormLink/FormLink.svelte';
import type AppStorage from '../Storage/App/AppStorage';
import type { FormInstance } from '../FormInstance';
import type { IFieldMetadata } from '../Metadata/IFieldMetadata';
import type { FormMetadata } from '../Metadata/FormMetadata';
import { FormResponse } from './FormResponse';
import { IFormContainer } from './IFormContainer';
import { FormLink } from '../Metadata';
import { IFormlinkBase } from '../../Outputs/FormLink/IFormlinkBase';

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

export class UimfApp implements IUimfApp {
	constructor(app: IUimfApp) {
		this.appStorage = app.appStorage;
		this.#app = app;
		this.formsById = app.formsById;
	}

	#app: IUimfApp;
	appStorage: AppStorage;
	formsById: { [id: string]: FormMetadata };

	renderForm(options: { data: any; metadata: IFieldMetadata; form: FormInstance | null }): Element {
		return this.#app.renderForm(options);
	}
	runResponseHandler(response: FormResponse): Promise<void> {
		return this.#app.runResponseHandler(response);
	}
	runClientFunctions(response: FormResponse, parentForm?: FormInstance | null): Promise<void> {
		return this.#app.runClientFunctions(response, parentForm);
	}
	handleCustomFormLinkAction(value: IFormLinkData, inputFieldValues: any): void {
		return this.#app.handleCustomFormLinkAction(value, inputFieldValues);
	}
	confirm(options: IConfirmOptions): Promise<void> {
		return this.#app.confirm(options);
	}
	alert(options: IAlertOptions): Promise<void> {
		return this.#app.alert(options);
	}
	openModal(options: IModalOptions): Promise<void> {
		return this.#app.openModal(options);
	}
	openHtmlModal(options: IHtmlModalOptions): Promise<void> {
		return this.#app.openHtmlModal(options);
	}
	makeUrl(link: IFormlinkBase): Promise<string> {
		return this.#app.makeUrl(link);
	}
	goto(link: FormLink): Promise<void> {
		return this.#app.goto(link);
	}
	postForm<T extends FormResponse>(
		form: string,
		data: any,
		config: IPostFormConfig | null
	): Promise<T> {
		return this.#app.postForm(form, data, config);
	}
	getApiFile(url: string): Promise<Response> {
		return this.#app.getApiFile(url);
	}
	getApi(form: string): Promise<Response> {
		return this.#app.getApi(form);
	}
	getResponseHandler(handler: string) {
		return this.#app.getResponseHandler(handler);
	}
	getForm(formId: string): Promise<FormInstance> {
		return this.#app.getForm(formId);
	}
	hasPermission(permission?: string | null): boolean {
		return this.#app.hasPermission(permission);
	}
	colorFromString(str: string, options?: ColorOptions | null): string {
		return this.#app.colorFromString(str, options);
	}
	getDefaultValue(valueName: string) {
		switch (valueName) {
			case 'currentUser':
				return localStorage.internaluser.Id;
			default:
				return valueName;
		}
	}
	showFormInSection(
		formId: string,
		inputFieldValues: any,
		sectionId: string,
		visibleOnlyTo?: string[]
	): void {
		return this.#app.showFormInSection(formId, inputFieldValues, sectionId, visibleOnlyTo);
	}
}

export default interface IUimfApp {
	appStorage: AppStorage;
	showFormInSection(
		formId: string,
		inputFieldValues: any,
		sectionId: string,
		visibleOnlyTo?: string[]
	): void;
	renderForm(options: { data: any; metadata: IFieldMetadata; form: FormInstance | null }): Element;
	runResponseHandler(response: FormResponse): Promise<void>;
	runClientFunctions(response: FormResponse, parentForm?: FormInstance | null): Promise<void>;
	handleCustomFormLinkAction(value: IFormLinkData, inputFieldValues: any): void;
	confirm(options: IConfirmOptions): Promise<void>;
	alert(options: IAlertOptions): Promise<void>;
	openModal(options: IModalOptions): Promise<void>;
	openHtmlModal(options: IHtmlModalOptions): Promise<void>;
	formsById: { [id: string]: FormMetadata };
	makeUrl(link: IFormlinkBase): Promise<string>;
	goto(link: FormLink): Promise<void>;
	postForm<T extends FormResponse>(
		form: string,
		data: any,
		config: IPostFormConfig | null
	): Promise<T>;
	getApiFile(url: string): Promise<Response>;
	getApi(form: string): Promise<Response>;
	getResponseHandler(handler: string): any;
	getForm(formId: string): Promise<FormInstance>;
	hasPermission(permission?: string | null): boolean;
	colorFromString(str: string, options?: ColorOptions | null): string;
}
