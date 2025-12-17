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

        delete $localStorage.Cart;
        $localStorage.Impersonator = $localStorage.ExternalUser;
        $localStorage.ExternalUser = userDetails;
        $localStorage.isPunchoutUser = userDetails.IsPunchoutUser;

        window.location.hash = '/';
    }
}

