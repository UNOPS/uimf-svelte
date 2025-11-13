import type { IFormLinkData } from "$lib/Outputs/FormLink/IFormLinkData";
import type { UimfApp } from "../App/UimfApp";

/**
 * Contract implemented by all Svelte-side form link actions.
 *
 * Handlers receive the original metadata, the resolved input values,
 * and the high-level `UimfApp` API surface so they can reuse existing helpers
 * (e.g. `postForm`, `getApi`, modal helpers, etc.).
 */
export interface IFormLinkAction {
    handle(
        formLink: IFormLinkData,
        inputFieldValues: any,
        app: UimfApp
    ): void | Promise<void>;
}

