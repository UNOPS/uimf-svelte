import type { IClientFunction } from "../IClientFunction";

export class AppReload implements IClientFunction {
    name: string = "app-reload";

    handle(_params?: any): void {
        location.reload();
    }
}


