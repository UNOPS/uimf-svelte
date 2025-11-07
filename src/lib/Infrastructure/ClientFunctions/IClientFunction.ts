export interface IClientFunction {
    readonly name: string;
    
    handle(params?: any): void;
}
