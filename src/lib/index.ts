// Reexport your entry components here
import { defaultControlRegister } from "./Infrastructure/ControlRegister";
import SmartNavigator from './Components/SmartNavigator.svelte';
import './scss/styles.scss';

declare global {
    interface Window {
        SvelteComponents: any;
    }
}

window.SvelteComponents = {
    SmartNavigator,
    controlRegister: defaultControlRegister
};