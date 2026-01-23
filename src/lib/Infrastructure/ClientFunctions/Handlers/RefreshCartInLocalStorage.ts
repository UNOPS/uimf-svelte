import type { IClientFunction } from "../IClientFunction";

export class RefreshCartInLocalStorage implements IClientFunction {
    name: string = "refresh-cart-in-local-storage";

    handle(params?: any): Promise<void> {

        try {
            const updatedCart = params?.functionToRun?.CustomProperties?.UpdatedCart;

            if (!updatedCart || !updatedCart.ShoppingCartItems) {
                return Promise.resolve();
            }

            const uimfApp = params?.uimfApp;

            if (!uimfApp) {
                return Promise.resolve();
            }

            updatedCart.ShoppingCartItems.forEach((item: any, index: number) => {
                item.StopNagging = false;

                try {
                    item.priceData = uimfApp.getPriceData(item);
                } catch (error) {
                    throw error;
                }
            });

            uimfApp.populateCart(updatedCart);

            // Update user context with cart's destination country and client node.
            // This ensures that saveShoppingCartAndGetChanges() uses the correct values
            // when the user resumes a cart with a different destination/organization.
            this.updateUserContext(updatedCart);

            return Promise.resolve();
        } catch (error) {
            return Promise.resolve();
        }
    }

    private updateUserContext(updatedCart: any): void {
        const $rootScope = (window as any).legacy?.$rootScope;
        const $localStorage = (window as any).legacy?.$localStorage;

        if (!$rootScope || !$localStorage?.ExternalUser) {
            return;
        }

        // Update destination country in user context
        if (updatedCart.DestinationCountryId) {
            $localStorage.ExternalUser.DestinationCountry.CountryId = updatedCart.DestinationCountryId;
            $localStorage.ExternalUser.DestinationCountry.CountryName = updatedCart.DestinationCountryName;
            $localStorage.ExternalUser.DestinationCountry.CountryCode = updatedCart.DestinationCountryCode;

            $rootScope.CountryCode = updatedCart.DestinationCountryCode;
            $rootScope.CountryName = updatedCart.DestinationCountryName;
        }

        // Update client node proxy (organization) in user context
        if (updatedCart.ClientNodeId) {
            $localStorage.ExternalUser.ClientNodeProxyId = updatedCart.ClientNodeId;
        }
    }
}

