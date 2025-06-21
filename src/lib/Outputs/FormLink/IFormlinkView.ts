import type { IFrontendVariableValue } from '../../Infrastructure/AppStorage';

export interface IFormlinkView {
	CssClass?: string;
	Icon?: string;
	Label?: string;
	RequiredValue: IFrontendVariableValue;
}