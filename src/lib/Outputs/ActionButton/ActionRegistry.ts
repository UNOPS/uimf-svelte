import { PrintHandler } from "./Actions/PrintHandler";
import { RedirectToFormHandler } from "./Actions/RedirectToFormHandler";
import { RedirectToUrlHandler } from "./Actions/RedirectToUrlHandler";
import { SetFieldValuesHandler } from "./Actions/SetFieldValuesHandler";

export const ActionRegistry: Record<string, any> = {
    'set-field-values': SetFieldValuesHandler,
    print: PrintHandler,
    'redirect-to-form': RedirectToFormHandler,
    'redirect-to-url': RedirectToUrlHandler
};