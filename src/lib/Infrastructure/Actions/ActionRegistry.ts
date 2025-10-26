import { PrintHandler } from "./Handlers/PrintHandler";
import { RedirectToFormHandler } from "./Handlers/RedirectToFormHandler";
import { RedirectToUrlHandler } from "./Handlers/RedirectToUrlHandler";
import { SetFieldValuesHandler } from "./Handlers/SetFieldValuesHandler";


export const ActionRegistry: Record<string, any> = {
    'set-field-values': SetFieldValuesHandler,
    print: PrintHandler,
    'redirect-to-form': RedirectToFormHandler,
    'redirect-to-url': RedirectToUrlHandler
};