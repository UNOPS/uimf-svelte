import { IClientFunction } from "../IClientFunction";

export class GrowlMessage implements IClientFunction {
    name: string = "growl-message";

    handle(params?: any): void {
        const type = (params?.functionToRun?.CustomProperties?.Type || "success").toLowerCase();
        const message = params?.functionToRun?.CustomProperties?.Message || "";

        if (!message) {
            return;
        }

        try {
            const event = new CustomEvent("uimf-growl", {
                detail: { type, message, ttl: 5000 }
            });
            window.dispatchEvent(event);
        } catch {
            console[type === "error" ? "error" : type === "warning" ? "warn" : "log"](message);
        }

        // Use alert for immediate user feedback
        alert(message);
    }
}


