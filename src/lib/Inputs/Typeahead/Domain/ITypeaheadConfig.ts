import type { ITypeaheadOption } from './index';
import { IPickerSourceConfig } from "./Picker/IPickerSourceConfig";

export interface ITypeaheadConfig extends IPickerSourceConfig<ITypeaheadOption> {
    DefaultValue?: string | null;
}