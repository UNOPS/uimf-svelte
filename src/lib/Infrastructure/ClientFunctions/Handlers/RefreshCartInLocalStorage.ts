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

            return Promise.resolve();
        } catch (error) {
            return Promise.resolve();
        }
    }
}

