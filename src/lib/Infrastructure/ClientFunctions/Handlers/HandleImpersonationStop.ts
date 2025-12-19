import type { IClientFunction } from "../IClientFunction";

export class HandleImpersonationStop implements IClientFunction {
	name: string = "handle-impersonation-stop";

	handle(params?: any): void {
		const impersonatorDetails = params?.functionToRun?.CustomProperties?.ImpersonatorDetails;

		if (!impersonatorDetails) {
			console.error("[HandleImpersonationStop] Impersonator details not provided");
			return;
		}

		const $localStorage = (window as any).legacy?.$localStorage;

		// Clear cart-related localStorage data
		delete $localStorage.Cart;
		delete $localStorage.AvailableCarts;
		delete $localStorage.PrefilledCarts;

		// Restore original user from impersonator
		$localStorage.ExternalUser = impersonatorDetails;
		$localStorage.isPunchoutUser = impersonatorDetails.IsPunchoutUser;

		// Remove impersonator tracking
		delete $localStorage.Impersonator;

		window.location.hash = '/';
	}
}
