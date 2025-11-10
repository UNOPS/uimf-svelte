import { IClientFunction } from "../IClientFunction";

export class UpdateCulture implements IClientFunction {
    name: string = "update-culture";

    handle(params?: any): void {

        // Access Angular's $localStorage and $rootScope through the window object
        const angularElement = (window as any).angular?.element;
        if (!angularElement) {
            console.error("[UpdateCulture] Angular is not available");
            return;
        }

        const $rootScope = angularElement(document.body).scope()?.$root;
        const $localStorage = angularElement(document.body).injector()?.get('$localStorage');

        if (!$rootScope || !$localStorage) {
            return;
        }

        const props = params?.functionToRun?.CustomProperties;
        if (!props) {
            return;
        }

        // Store initial values to detect changes
        const initial = {
            destinationCountryId: parseInt($localStorage.ExternalUser.DestinationCountry.CountryId),
            defaultCurrencyId: $localStorage.ExternalUser.DefaultCurrency.Id,
            ClientNodeProxyId: $localStorage.ExternalUser ? $localStorage.ExternalUser.ClientNodeProxyId : null
        };

        // Update localStorage with new culture data
        $localStorage.ExternalUser.DefaultCurrency.ExchangeRate = props.ExchangeRate;
        $localStorage.ExternalUser.DefaultCurrency.Id = props.DefaultCurrencyId;
        $localStorage.ExternalUser.DefaultCurrency.Code = props.CurrencyCode;
        $localStorage.ExternalUser.DestinationCountry.CountryId = props.DestinationCountryId;
        $localStorage.ExternalUser.DestinationCountry.CountryName = props.CountryName;
        $localStorage.ExternalUser.DestinationCountry.CountryCode = props.CountryCode;
        $localStorage.ExternalUser.ClientNodeProxyId = props.ClientNodeProxyId;

        // Update rootScope to trigger Angular UI updates
        $rootScope.CurrencyCode = props.CurrencyCode;
        $rootScope.CountryCode = props.CountryCode;
        $rootScope.CountryName = props.CountryName;
        $rootScope.ClientNodeProxyName = $localStorage.ExternalUser.ClientNodeProxyId === $localStorage.ExternalUser.ClientNodeId
            ? null
            : props.ClientNodeProxyName;

        // Detect what changed
        const currencyChanged = props.DefaultCurrencyId !== initial.defaultCurrencyId;
        const clientNodeProxyChanged = props.ClientNodeProxyId !== initial.ClientNodeProxyId;
        const countryChanged = props.DestinationCountryId !== initial.destinationCountryId;

        // Show info message if currency changed
        if (currencyChanged) {
            const growl = angularElement(document.body).injector()?.get('growl');
            if (growl) {
                growl.info("Any value or price shown in other currency than the base price and currency are for illustrative purposes only.", {});
            }
        }

        // Clear storage if country or client node changed
        if (countryChanged || clientNodeProxyChanged || props.ShoppingCartId) {
            delete $localStorage.CompareProducts;

            const uimfApp = params?.uimfApp;
            if (uimfApp?.appStorage) {
                uimfApp.appStorage.clear();
            }
        }

        const catalogueList = props.CatalogueList;

        // Update the list of visible catalogues for the selected destination country
        if (Array.isArray(catalogueList)) {
            $rootScope.catalogues = catalogueList;
            $localStorage.catalogues = catalogueList;
        }

        // Reload shopping cart and catalogues
        const shoppingCartId = props.Id || props.ShoppingCartId;
        $rootScope.reloadCataloguesShoppingcart(shoppingCartId);

        // Listen for shopping cart reload completion
        const unsubscribe = $rootScope.$on('shoppingCartReloaded', function () {
            $rootScope.$broadcast("currentCartSet");
            unsubscribe();
        });

        // Redirect to dashboard
        window.location.href = '/#/form/client-dashboard-2';
    }
}



