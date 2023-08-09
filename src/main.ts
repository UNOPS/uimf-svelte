import { defaultControlRegister } from "./lib/Infrastructure/ControlRegister";
import SmartNavigator from './lib/Components/SmartNavigator.svelte';

var SvelteComponents = {
    controlRegister: defaultControlRegister,
    SmartNavigator
};

declare global {
    interface Window {
        SvelteComponents: any;
    }
};

window.SvelteComponents = SvelteComponents;