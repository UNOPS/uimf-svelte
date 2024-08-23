export interface OutputData {
    value: any;
    setValue: (v: any) => void
}

export interface OutputOptions {
    cssClass: string;
    popover: string;
    tooltip: string;
}

export interface IOutputFieldMetadata<TConfiguration = any> extends IFieldMetadata<TConfiguration> {
    Layout?: 'vertical' | 'horizontal' | 'default' | undefined | null;
    CssClass?: string | null;
}

export interface IInputFieldMetadata<TConfiguration = any> extends IFieldMetadata<TConfiguration> {
    Required: boolean;
}

export interface IFieldMetadata<TConfiguration = any> {
    Id: string;
    Hidden: boolean;
    CustomProperties?: any | null;
    Label: string;
    OrderIndex: number;
    Component: IComponent<TConfiguration>;
}

export interface IComponent<T = any | null | undefined> {
    Type: string;
    Configuration: T;
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

/**
 * Represents a reference to a form.
 */
export class FormLink {
    /**
     * Gets or sets name of the form to link to.
     */
    public Form!: string;

    /**
     * Gets or sets values for the input fields of the form (i.e. - <see cref="FormMetadata.InputFields"/>).
     */
    public InputFieldValues: any;

    /**
     * Gets or sets label to be shown on the client when rendering the link.
     */
    public Label?: string;
}