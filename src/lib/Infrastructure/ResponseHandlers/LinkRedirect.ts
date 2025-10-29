import { IFormResponseHandler } from "./IFormResponseHandler";

export class LinkRedirect implements IFormResponseHandler {
    name: string = "link-redirect";

    handle(response: any): void {
        if (response.OpenNewWindow) {
            window.open(response.RedirectUrl, '_blank');
            return;
        }

        window.location.href = response.RedirectUrl;
    }
}