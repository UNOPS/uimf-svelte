import type { IClientFunction } from "../IClientFunction";

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

        console.error("set-toggle-variables: Cannot access appStorage");
    }
}



