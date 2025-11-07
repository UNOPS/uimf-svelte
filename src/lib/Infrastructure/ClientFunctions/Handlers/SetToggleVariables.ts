import { IClientFunction } from "../IClientFunction";

export class SetToggleVariables implements IClientFunction {
    name: string = "set-toggle-variables";

    handle(params?: any): void {
        const frontEndVariable = params?.functionToRun?.CustomProperties?.FrontEndVariable;

        if (!frontEndVariable) {
            return;
        }

        const uimfApp = params?.uimfApp;
        if (uimfApp?.appStorage) {
            uimfApp.appStorage.toggleVariable(frontEndVariable);
            return;
        }

        // Fallback: try to access uimfApp from Angular
        const angularElement = (window as any).angular?.element;
        if (angularElement) {
            const injector = angularElement(document.body).injector();
            const angularUimfApp = injector?.get('uimfApp');
            if (angularUimfApp?.appStorage) {
                angularUimfApp.appStorage.toggleVariable(frontEndVariable);
                return;
            }
        }

        console.error("set-toggle-variables: Cannot access appStorage");
    }
}



