import type { IFrontendVariableValue } from "$lib/Infrastructure/Storage/App/IFrontendVariableValue";

export interface IFormlinkView {
	CssClass?: string;
	Icon?: string;
	Label?: string;
	RequiredValue: IFrontendVariableValue;
}