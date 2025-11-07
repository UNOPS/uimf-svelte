import { Redirect } from "./Handlers/Redirect";
import { LinkRedirect } from "./Handlers/LinkRedirect";

const redirectInstance = new Redirect();
const linkRedirectInstance = new LinkRedirect();

// Export handlers as callable functions for compatibility with FormFactory.js
// which calls them directly as: customHandler(response)
export const ResponseHandlerRegistry: Record<string, any> = {
    'redirect': (response: any) => redirectInstance.handle(response),
    'link-redirect': (response: any) => linkRedirectInstance.handle(response)
};