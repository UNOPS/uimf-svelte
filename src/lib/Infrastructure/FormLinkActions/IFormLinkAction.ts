import type { IFormLinkData } from "$lib/Outputs/FormLink/IFormLinkData";
import type { UimfApp } from "../App/UimfApp";

export interface IFormLinkAction {
    handle(
        formLink: IFormLinkData,
        inputFieldValues: any,
        app: UimfApp
    ): void | Promise<void>;
}

