import { IClientFunction } from "../IClientFunction";

export class Alert implements IClientFunction {
    name: string = "alert";

    handle(params?: any): Promise<any> {
        const props = params?.functionToRun?.CustomProperties;
        const message = props?.Message || "";
        const header = props?.Header || "";
        const isError = props?.IsError || false;

        // Emit event for app-level modal handling
        try {
            const event = new CustomEvent("uimf-alert", { detail: { props, params } });
            window.dispatchEvent(event);
        } catch { }

        // Fallback to browser alert
        if (message) {
            alert((header ? header + "\n\n" : "") + message);
        }

        return Promise.resolve({ Stop: isError });
    }
}





