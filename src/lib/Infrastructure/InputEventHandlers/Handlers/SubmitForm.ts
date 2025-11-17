import { IInputHandler, type IInputHandlerParameters } from '../IInputHandler';

export class SubmitForm implements IInputHandler {
   
    fn(params: IInputHandlerParameters): void {
        params.form?.submit(false);
    }
    
    runAt = 'input:change';
}

