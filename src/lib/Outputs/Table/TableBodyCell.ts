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

    constructor(parent: IFormComponent, data: any, column: IField) {
        this.isInput = column.IsInput;

        if (column.IsInput) {
            this.controller = controlRegister.createInput({
                app: parent.app,
                form: parent.form,
                metadata: column.Metadata,
                defer: null
            }).controller;
        }
        else {
            this.controller = new OutputController<any>(
                {
                    metadata: column.Metadata,
                    data: data[column.Metadata.Id],
                    form: parent.form!,
                    app: parent.app
                }
            );
        }

        this.cssClass = column.Metadata?.CustomProperties?.ColumnCssClass;
    }
}
