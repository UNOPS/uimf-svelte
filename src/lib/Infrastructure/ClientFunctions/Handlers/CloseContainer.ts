import { IClientFunction } from "../IClientFunction";

export class CloseContainer implements IClientFunction {
    name: string = "close-container";

    handle(params?: any): Promise<any> {
        const form = params?.parentForm?.parentForm;

        if (form != null && typeof form.fire === "function") {
            form.fire('form:close', params);
        }

        return Promise.resolve({ Stop: true });
    }
}





