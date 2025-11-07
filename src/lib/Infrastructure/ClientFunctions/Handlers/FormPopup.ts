import { IClientFunction } from "../IClientFunction";

export class FormPopup implements IClientFunction {
    name: string = "form-popup";

    handle(params?: any): void {
        const form = params?.functionToRun?.CustomProperties?.Form;
        const inputFieldValues = params?.functionToRun?.CustomProperties?.InputFieldValues;

        // Emit an event that an app-level listener can use to open a modal
        try {
            const ev = new CustomEvent('uimf-open-modal', { detail: { form, inputFieldValues, params } });
            window.dispatchEvent(ev);
        } catch { }
    }
}






