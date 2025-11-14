import { GeneratePdfAction } from "./Handlers/GeneratePdfAction";
import type { IFormLinkAction } from "./IFormLinkAction";

export const FormLinkActionRegistry: Record<string, IFormLinkAction> = {
    "generate-pdf": new GeneratePdfAction()
};