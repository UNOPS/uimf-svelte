import type { OutputController } from '../../Infrastructure/OutputController';
import type { ComponentMetadata } from "../../Infrastructure/uimf";
import type { TableExtension } from "./TableExtension";
import { Table } from "./Table";

export class TableBuilder {
    private extensions: TableExtension[] = [];

    constructor(extensions: TableExtension[]) {
        this.extensions = extensions || [];
    }

    public build(parent: OutputController<any>, rows: any[], columns: ComponentMetadata[]): Table {
        return new Table(parent, rows, columns, this.extensions);
    }
}
