import type { IFrontendVariableValue } from "$lib/Infrastructure/Storage/App/IFrontendVariableValue";
import type { IDynamicInputValue } from './IDynamicInputValue';
import type { IFormlinkView } from './IFormlinkView';

export interface IFormLinkData {
	VisibleOnlyTo?: string[];
	AlternativeView?: IFormlinkView;
	ToggledVariable?: IFrontendVariableValue;
	Icon?: string;
	Label?: string;
	Target?: string | null;
	ConfirmationMessage?: string;
	InputFieldValues?: any;
	Action?: any;
	RequiredPermission?: string;
	Form: string;
	Field?: string | null;
	Controller?: any;
	DocumentType?: string;
	Filename?: string;
	CssClass?: string;
	Tooltip?: string;
	Deadline?: string;
	RenderInputTargets?: { [key: string]: string };
	RenderOutputTargets?: { [key: string]: string };
	DynamicInputValues?: { [key: string]: IDynamicInputValue };

	// Html modal options.
	StateParams?: any;
	TemplateUrl?: string;
	Resolve?: any;
	Size?: string;
	WindowClass?: string;
	Group?: string | null;
}