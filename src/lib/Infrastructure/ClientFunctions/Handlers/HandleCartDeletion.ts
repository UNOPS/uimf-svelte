import type { IClientFunction } from "../IClientFunction";

interface CartDeletionParams {
	functionToRun: {
		CustomProperties: {
			CartId: number;
			IsPrefilled: boolean;
		};
	};
}

interface CartItem {
	Id: number;
}

export class HandleCartDeletion implements IClientFunction {
	name: string = "handle-cart-deletion";

	handle(params?: CartDeletionParams): Promise<void> {
		try {
			const cartId = params?.functionToRun?.CustomProperties?.CartId;
			const isPrefilled = params?.functionToRun?.CustomProperties?.IsPrefilled ?? false;

			if (!cartId) {
				return Promise.resolve();
			}

			const storage = window.localStorage;

			if (isPrefilled) {
				this.removeFromList(storage, 'PrefilledCarts', cartId);
			} else {
				this.removeFromList(storage, 'AvailableCarts', cartId);
			}

			return Promise.resolve();
		} catch (error) {
			console.error('Error handling cart deletion:', error);
			return Promise.resolve();
		}
	}

	private removeFromList(storage: Storage, listName: string, cartId: number): void {
		const carts: CartItem[] = JSON.parse(storage.getItem(listName) || '[]');
		const index = carts.findIndex((c: CartItem) => c.Id === cartId);

		if (index !== -1) {
			carts.splice(index, 1);
			storage.setItem(listName, JSON.stringify(carts));
		}
	}
}
