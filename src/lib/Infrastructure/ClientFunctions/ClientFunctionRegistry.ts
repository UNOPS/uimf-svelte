import { AppLogout } from "./Handlers/AppLogout";
import { AppReload } from "./Handlers/AppReload";
import { GrowlMessage } from "./Handlers/GrowlMessage";
import { FormReload } from "./Handlers/FormReload";
import { CloseForm } from "./Handlers/CloseForm";
import { RedirectToForm } from "./Handlers/RedirectToForm";
import { RedirectToUrl } from "./Handlers/RedirectToUrl";
import { FormPopup } from "./Handlers/FormPopup";
import { UpdateCulture } from "./Handlers/UpdateCulture";
import { GeneratePdf } from "./Handlers/GeneratePdf";
import { SendPdfByEmail } from "./Handlers/SendPdfByEmail";
import { RefreshCartInLocalStorage } from "./Handlers/RefreshCartInLocalStorage";
import { Download } from "./Handlers/Download";
import { Alert } from "./Handlers/Alert";
import { SetToggleVariables } from "./Handlers/SetToggleVariables";
import { CloseContainer } from "./Handlers/CloseContainer";

export const ClientFunctionRegistry: Record<string, any> = {
    'app-logout': new AppLogout(),
    'app-reload': new AppReload(),
    'growl-message': new GrowlMessage(),
    'form-reload': new FormReload(),
    'close-form': new CloseForm(),
    'redirect-to-form': new RedirectToForm(),
    'redirect-to-url': new RedirectToUrl(),
    'form-popup': new FormPopup(),
    'update-culture': new UpdateCulture(),
    'generate-pdf': new GeneratePdf(),
    'send-pdf-by-email': new SendPdfByEmail(),
    'refresh-cart-in-local-storage': new RefreshCartInLocalStorage(),
    'download': new Download(),
    'alert': new Alert(),
    'set-toggle-variables': new SetToggleVariables(),
    'close-container': new CloseContainer(),
};