import type { IClientFunction } from "../IClientFunction";

export class HandleImpersonationSuccess implements IClientFunction {
    name: string = "handle-impersonation-success";

    handle(params?: any): void {
        const userDetails = params?.functionToRun?.CustomProperties?.UserDetails;

        if (!userDetails) {
            console.error("[HandleImpersonationSuccess] User details not provided");
            return;
        }

        const $localStorage = (window as any).legacy?.$localStorage;

        // Clear all cart-related localStorage data from the impersonator
        delete $localStorage.Cart;
        delete $localStorage.AvailableCarts;
        delete $localStorage.PrefilledCarts;

        // Switch to the impersonatee's user details in Angular's $localStorage
        $localStorage.Impersonator = $localStorage.ExternalUser;
        $localStorage.ExternalUser = userDetails;
        $localStorage.isPunchoutUser = userDetails.IsPunchoutUser;

        // CRITICAL: Immediately write to browser localStorage so UimfApp.#myFetch can read it
        // Angular's $localStorage sync is async, but we need this available NOW for the next request
        localStorage.setItem('ngStorage-Impersonator', JSON.stringify($localStorage.Impersonator));
        localStorage.setItem('ngStorage-ExternalUser', JSON.stringify(userDetails));
        localStorage.setItem('ngStorage-isPunchoutUser', JSON.stringify(userDetails.IsPunchoutUser));

        window.location.hash = '/';
    }
}

