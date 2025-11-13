import { GeneratePdfAction } from "./Handlers/GeneratePdfAction";
import type { IFormLinkAction } from "./IFormLinkAction";

/**
 * Central registry for Svelte form link actions.
 *
 * To add a new action:
 * 1. Create a handler in `FormLinkActions/Handlers/`.
 * 2. Implement `IFormLinkAction.handle` and perform any async work there.
 * 3. Register the handler in this map (the key must match the backend `FormLink.Action` value).
 *
 * Example:
 *
 * ```ts
 * import { MyCustomAction } from "./Handlers/MyCustomAction";
 *
 * export const FormLinkActionRegistry: Record<string, IFormLinkAction> = {
 *     "my-custom-action": new MyCustomAction(),
 *     // keep existing registrations below
 * };
 * ```
 */
export const FormLinkActionRegistry: Record<string, IFormLinkAction> = {
    "generate-pdf": new GeneratePdfAction()
};

