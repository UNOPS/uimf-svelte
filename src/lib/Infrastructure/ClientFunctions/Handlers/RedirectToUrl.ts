import { IClientFunction } from "../IClientFunction";

export class RedirectToUrl implements IClientFunction {
    name: string = "redirect-to-url";

    handle(params?: any): void {
        const url = params?.functionToRun?.CustomProperties?.url;
        if (typeof url === "string" && url.length > 0) {
            (window as any).location = url;
        }
    }
}






