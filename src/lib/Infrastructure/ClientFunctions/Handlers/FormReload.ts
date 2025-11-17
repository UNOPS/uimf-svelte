import type { IClientFunction } from "../IClientFunction";

export class FormReload implements IClientFunction {
    name: string = "form-reload";

    handle(params?: any): void {
        const forms = document.querySelectorAll('uimf-form');
        for (let i = 0; i < forms.length; i++) {
            if (params?.parentForm != null && params.parentForm.element === forms[i]) {
                // Do not reload the form that triggered this client function.
                // If we don't do this then the form that was just posted will be re-posted
                // once again.
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






