import { FormInstance } from "../FormInstance";

export interface IInputHandlerParameters{
    form: FormInstance | null;
}

export interface IInputHandler {
    fn(params?: IInputHandlerParameters): void;
}