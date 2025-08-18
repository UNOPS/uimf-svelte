import type { IInputFieldMetadata } from "./IInputFieldMetadata";
import type { IOutputFieldMetadata } from "./IOutputFieldMetadata";
import type { SmartNavigatorCustomProperty } from "./SmartNavigatorCustomProperty";

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
