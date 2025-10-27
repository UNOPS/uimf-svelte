// Reexport your entry components here
import { defaultControlRegister } from "./Infrastructure/ControlRegister";
import AppStorage from "./Infrastructure/Storage/App/AppStorage";
import SmartNavigator from './Components/SmartNavigator.svelte';
import './scss/styles.scss';
import { UimfApp } from "./Infrastructure/App/UimfApp";

declare global {
    interface Window {
        SvelteComponents: any;
    }
}

window.SvelteComponents = {
    SmartNavigator,
    AppStorage,
    controlRegister: defaultControlRegister,
    UimfApp
};