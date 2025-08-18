import { IInputFieldMetadata } from "./IInputFieldMetadata";
import { IOutputFieldMetadata } from "./IOutputFieldMetadata";
import { SmartNavigatorCustomProperty } from "./SmartNavigatorCustomProperty";

export interface FormMetadata {
    CloseOnPostIfModal: boolean;
    CustomProperties: null | {
        SubmitButtonLabel: string;
        ShowClearButton: boolean;
        SmartNavigator: null | SmartNavigatorCustomProperty;
    };
    EventHandlers: Array<any> | null;
    Id: string;
    Label: string;
    InputFields: IInputFieldMetadata[];
    OutputFields: IOutputFieldMetadata[];
    PostOnLoad: boolean;
    PostOnLoadValidation: boolean;
    Documentation?: string | null;
}
