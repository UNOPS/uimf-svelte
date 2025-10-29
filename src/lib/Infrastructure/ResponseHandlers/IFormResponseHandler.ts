export interface IFormResponseHandler {
    readonly name: string;

    handle(response: any): void;
}
