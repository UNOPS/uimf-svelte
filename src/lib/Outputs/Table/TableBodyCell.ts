import { IInputFieldMetadata } from '../../Infrastructure/uimf';
import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
import type { IFormComponent } from '../../Infrastructure/IFormComponent';
import type { InputController } from '../../Infrastructure/InputController';
import { OutputController } from '../../Infrastructure/OutputController';
import type { IField } from './IColumn';


export class TableBodyCell {
    public controller: OutputController<any> | InputController<any>;
    public cssClass: string;
    public colspan: number = 0;
    public readonly isInput: boolean;
    public element: HTMLElement | null = null;

    /**
     * Indicates whether the content of the cell should be hidden.
     */
    public hidden: boolean = false;

    constructor(parent: IFormComponent, data: any, field: IField) {
        this.isInput = field.IsInput;

        if (field.IsInput) {
            this.controller = controlRegister.createInput({
                app: parent.app,
                form: parent.form,
                metadata: field.Metadata as IInputFieldMetadata
            }).controller;
        }
        else {
            this.controller = new OutputController<any>(
                {
                    metadata: field.Metadata,
                    data: data[field.Metadata.Id],
                    form: parent.form!,
                    app: parent.app,
                    parent: null
                }
            );
        }

        this.cssClass = field.Metadata?.CustomProperties?.ColumnCssClass;
    }
}
