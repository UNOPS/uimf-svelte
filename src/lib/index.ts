// Reexport your entry components here
import { defaultControlRegister } from "./Infrastructure/ControlRegister";
import AppStorage from "./Infrastructure/Storage/App/AppStorage";
import SmartNavigator from './Components/SmartNavigator.svelte';
import './scss/styles.scss';
import { UimfApp } from "./Infrastructure/App/UimfApp";
import { ClientFunctionRegistry } from "./Infrastructure/ClientFunctions/ClientFunctionRegistry";
import GlobalLoader from "./Components/Loader/GlobalLoader.svelte";

declare global {
    interface Window {
        SvelteComponents: any;
        __uimfLoader?: {
            start: () => void;
            stop: () => void;
        };
    }
}

window.SvelteComponents = {
    SmartNavigator,
    AppStorage,
    controlRegister: defaultControlRegister,
    UimfApp,
    ClientFunctionRegistry
};

if (typeof window !== 'undefined' && window.fetch && !window.__uimfLoader) {
    const originalFetch = window.fetch.bind(window);
    let loaderComponent: GlobalLoader | null = null;
    let loaderHost: HTMLElement | null = null;
    let pending = 0;

    function mountLoader(): void {
        if (loaderComponent != null) {
            return;
        }

        loaderHost = document.createElement('div');
        document.body.appendChild(loaderHost);

        loaderComponent = new GlobalLoader({
            target: loaderHost,
            props: { visible: true }
        });
    }

    function unmountLoader(): void {
        if (loaderComponent == null) {
            return;
        }

        loaderComponent.$destroy();
        loaderComponent = null;

        if (loaderHost) {
            loaderHost.remove();
            loaderHost = null;
        }
    }

    function showLoader(): void {
        if (pending === 0) {
            mountLoader();
        }
        pending++;
    }

    function hideLoader(): void {
        pending = Math.max(0, pending - 1);
        if (pending === 0) {
            unmountLoader();
        }
    }

    window.__uimfLoader = {
        start: showLoader,
        stop: hideLoader
    };

    window.fetch = (input: RequestInfo | URL, init?: (RequestInit & { skipLoader?: boolean })) => {
        const skipLoader = init?.skipLoader === true;

        if (!skipLoader && typeof document !== 'undefined') {
            showLoader();
        }

        return originalFetch(input, init)
            .then((response) => {
                if (!skipLoader) {
                    hideLoader();
                }
                return response;
            })
            .catch((error) => {
                if (!skipLoader) {
                    hideLoader();
                }
                throw error;
            });
    };
}