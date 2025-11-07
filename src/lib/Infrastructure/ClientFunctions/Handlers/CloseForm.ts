import { IClientFunction } from "../IClientFunction";

export class CloseForm implements IClientFunction {
    name: string = "close-form";

    handle(params?: any): Promise<any> {
        
        const form = params?.parentForm;
        
        if (form != null && typeof form.fire === "function") {
            form.fire('form:close', params);
        } else {
            console.warn('[CloseForm] Cannot fire form:close - parentForm or fire method not available');
        }
        
        return Promise.resolve({ Stop: true });
    }
}




