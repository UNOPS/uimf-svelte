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
    CustomProperties?: any | null;
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