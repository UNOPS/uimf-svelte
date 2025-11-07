import { IFormResponseHandler } from "../IFormResponseHandler";

export class Redirect implements IFormResponseHandler {
    name: string = "redirect";

    handle(response: any): void {
        var params = response.InputFieldValues || {};

        var query = Object.keys(params).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        }).join('&');

        var url = '#/form/' + response.Form;

        if (query) {
            url += '?' + query;
        }

        window.location.href = url;
    }
}