export interface IDynamicInputValue {
	Name: string;
	Source: DynamicValueSource;
}

export enum DynamicValueSource {
	ParentForm = 'ParentForm',
	FrontendVariable = 'FrontendVariable',
	LocalSource = 'LocalSource'
}