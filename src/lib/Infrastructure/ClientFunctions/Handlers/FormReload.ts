import { IClientFunction } from "../IClientFunction";

export class FormReload implements IClientFunction {
    name: string = "form-reload";

    handle(params?: any): void {
        const forms = document.querySelectorAll('uimf-form');
        for (let i = 0; i < forms.length; i++) {
            if (params?.parentForm != null && params.parentForm.element === forms[i]) {
                continue;
            }
            const customEvent = new CustomEvent('client-function:form-reload', {
                bubbles: false,
                cancelable: false,
                detail: { targets: params?.functionToRun?.CustomProperties?.Targets || [] }
            });
            (forms[i] as Element).dispatchEvent(customEvent);
        }
    }
}






