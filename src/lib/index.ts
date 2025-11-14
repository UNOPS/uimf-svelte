// Reexport your entry components here
import { defaultControlRegister, type ControlRegister } from "./Infrastructure/ControlRegister";
import AppStorage from "./Infrastructure/Storage/App/AppStorage";
import type { SvelteComponent } from "svelte";
import SmartNavigator from './Components/SmartNavigator.svelte';
import './scss/styles.scss';
import { UimfApp } from "./Infrastructure/App/UimfApp";
import { ClientFunctionRegistry } from "./Infrastructure/ClientFunctions/ClientFunctionRegistry";
import { Loader } from "./Components/Loader/Loader";

export interface ISvelteComponents {
	SmartNavigator: typeof SvelteComponent<any>;
	AppStorage: typeof AppStorage;
	controlRegister: ControlRegister;
	UimfApp: typeof UimfApp;
	ClientFunctionRegistry: Record<string, any>;
	loader: Loader;
}

declare global {
    interface Window {
        SvelteComponents: ISvelteComponents;
    }
}

window.SvelteComponents = {
    SmartNavigator,
    AppStorage,
    controlRegister: defaultControlRegister,
    UimfApp,
    ClientFunctionRegistry,
    loader: new Loader()
};