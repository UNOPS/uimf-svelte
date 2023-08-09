import { OutputController } from '../../Infrastructure/OutputController';
import type { ComponentMetadata } from "../../Infrastructure/uimf";

export class TableBodyCell {
    public controller: OutputController<any>;
    public cssClass: string;
    public colspan: number = 0;

    constructor(parent: OutputController<any>, row: any, metadata: ComponentMetadata) {
        this.controller = new OutputController<any>(
            metadata,
            row[metadata.Id],
            parent.form,
            parent.app
        );

        this.cssClass = metadata?.CustomProperties?.ColumnCssClass;
    }
}
