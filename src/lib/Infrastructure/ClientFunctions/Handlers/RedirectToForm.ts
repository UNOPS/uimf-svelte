import { IClientFunction } from "../IClientFunction";

export class RedirectToForm implements IClientFunction {
    name: string = "redirect-to-form";

    handle(params?: any): void {
        const formlink = params?.functionToRun?.CustomProperties?.formlink;

        try {
            const ev = new CustomEvent('uimf-redirect-to-form', { detail: { formlink, params } });
            window.dispatchEvent(ev);
            return;
        } catch { }

        // Fallback: if a prebuilt URL is present, use it.
        if (typeof formlink === "string" && formlink.length > 0) {
            (window as any).location = formlink;
        }
    }
}






