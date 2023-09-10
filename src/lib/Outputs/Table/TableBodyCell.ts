import { OutputController } from '../../Infrastructure/OutputController';
import type { ComponentMetadata } from "../../Infrastructure/uimf";

export class TableBodyCell {
    public controller: OutputController<any>;
    public cssClass: string;
    public colspan: number = 0;

    constructor(parent: OutputController<any>, row: any, metadata: ComponentMetadata) {
        this.controller = new OutputController<any>(
            {
                metadata: metadata,
                data: row[metadata.Id],
                form: parent.form!,
                app: parent.app
            }
        );

        this.cssClass = metadata?.CustomProperties?.ColumnCssClass;
    }
}
