import { Redirect } from "./Redirect";
import { LinkRedirect } from "./LinkRedirect";

export const ResponseHandlerRegistry: Record<string, any> = {
    'redirect': new Redirect(),
    'link-redirect': new LinkRedirect()
};