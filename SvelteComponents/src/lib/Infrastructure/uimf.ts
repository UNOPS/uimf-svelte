export interface OutputData {
    value: any;
    setValue: (v: any) => void
}

export interface OutputOptions {
    cssClass: string;
    popover: string;
    tooltip: string;
}

export interface ComponentMetadata {
    Id: string;
    Required: boolean;
    Hidden: boolean;
    CustomProperties: any | null;
    Label: string;
    Type: string;
    OrderIndex: number;
}

export interface NestedComponentMetadata extends ComponentMetadata {
    Properties: ComponentMetadata[]
}

export interface InputField {
    Required: boolean;
    CustomProperties: null | any;
    EventHandlers: Array<any> | null;
    Id: string;
    Label: string;
    Type: string;
    Hidden: boolean;
    OrderIndex: number;
}

export interface SmartNavigatorCustomProperty {
    Label: null | string;
    RequiredInput: null | string;
}

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
    InputFields: Array<InputField>;
    OutputFields: Array<any>;
    PostOnLoad: Boolean;
    PostOnLoadValidation: Boolean;
}