import { IClientFunction } from "../IClientFunction";

export class RedirectToForm implements IClientFunction {
    name: string = "redirect-to-form";

    handle(params?: any): void {
        const formlink = params?.functionToRun?.CustomProperties?.formlink;
        if (formlink == null) {
            return;
        }

        const uimfApp = params?.uimfApp;
        if (uimfApp == null || typeof uimfApp.makeUrl !== "function") {
            return;
        }

        Promise.resolve(uimfApp.makeUrl(formlink)).then((url) => {
            if (url != null) {
                window.location.href = url;
            }
        });
    }
}
