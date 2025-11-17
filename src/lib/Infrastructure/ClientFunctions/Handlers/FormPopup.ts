import type { IClientFunction } from "../IClientFunction";

export class FormPopup implements IClientFunction {
    name: string = "form-popup";

    handle(params?: any): void {
        const customProperties = params?.functionToRun?.CustomProperties;
        if (customProperties == null) {
            return;
        }

        const utils = (window as any).legacy?.uimfUtils;
        if (utils != null) {
            utils.openModal({
                form: customProperties.Form,
                inputFieldValues: customProperties.InputFieldValues,
                parentForm: params?.parentForm,
                parentScope: params?.parentScope
            });
        }
    }
}

