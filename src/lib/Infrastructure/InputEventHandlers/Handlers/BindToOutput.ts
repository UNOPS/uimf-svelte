import { IInputHandler, IInputHandlerParameters } from '../IInputHandler';

export interface ISubmitFormArgs extends IInputHandlerParameters{
    input: any;
    eventHandler: any;
}

export class BindToOutput implements IInputHandler {
    
    fn(params: any): void {
        var input = params.input;
        var form = params.form;
        var eventHandler = params.eventHandler;

        var value = form.response[eventHandler.CustomProperties.OutputFieldId].value;
        form.inputs[input.Id].setValue(value);
    }
    
    runAt = 'form:responseHandled';
}

