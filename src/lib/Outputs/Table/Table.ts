import type { OutputController } from '../../Infrastructure/OutputController';
import type { TableExtension } from "./TableExtension";
import { TableBodyCell } from "./TableBodyCell";
import { TableHeadCell } from "./TableHeadCell";
import { TableRowGroup } from "./TableRowGroup";
import type { Colgroup } from "./Colgroup";
import EventSource from '../../Infrastructure/EventSource';

export class Table extends EventSource {
    public head: TableRowGroup<TableHeadCell>;
    public body: TableRowGroup<TableBodyCell>[] = [];
    public parent: OutputController<any>;
    public colgroups: Colgroup[] = [];

    constructor(parent: OutputController<any>, rows: any[], columns: any[], extensions: TableExtension[]) {
        super();

        this.parent = parent;

        // Ensure `rows` is not null.
        rows = rows ?? [];

        let sortedColumns = columns
            .filter((t) => !t.Hidden)
            .sort((a, b) => a.OrderIndex - b.OrderIndex);

        extensions.forEach(c => {
            c.init(this);
        });

        let headCells = sortedColumns.map((t) => {
            var cell = new TableHeadCell(t);
            extensions.forEach(c => {
                c.processHeadCell(this, cell, rows);
            });

            return cell;
        }).filter(t => !t.hidden);

        this.head = new TableRowGroup<TableHeadCell>(headCells);

        this.body = rows.map((t) => {
            var cells = this.head.main.cells.map((c) => new TableBodyCell(parent, t, c.metadata));
            var row = new TableRowGroup<TableBodyCell>(cells, t);
            extensions.forEach(c => c.processBodyRow(this, row));
            return row;
        });

        extensions.forEach(c => {
            c.processTable(this);
        });
    }
}
