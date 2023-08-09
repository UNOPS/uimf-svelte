import type { OutputFieldMetadata } from "$lib/uimf/ts/server";
import { Table, TableBodyCell, TableHeadCell, TableRowGroup } from "..";
import { TableExtension } from "../TableExtension";
import TableRow from "../TableRow";

export class RowGroupExtension extends TableExtension {
    private previousGroup: string;
    private groupByColumn: OutputFieldMetadata;
    private firstRow: TableRowGroup<TableBodyCell>;
    private firstRowProcessed: boolean = false;
    private groupCount: number = 0;

    init() {
        this.groupCount = 0;
        this.previousGroup = null;
        this.firstRow = null;
        this.firstRowProcessed = false;
    }

    processTable(table: Table): void {
        if (!this.firstRowProcessed && this.groupCount > 1) {
            var groupCell = new TableBodyCell(table.parent, this.firstRow.data, this.groupByColumn);

            groupCell.colspan = table.head.main.cells.length;

            const groupRow = new TableRow<TableBodyCell>([groupCell]);
            this.firstRow.above.push(groupRow);
        }
    }

    processBodyRow(table: Table, row: TableRowGroup<TableBodyCell>) {
        if (this.groupByColumn == null) {
            return;
        }

        var currentGroup = JSON.stringify(row.data[this.groupByColumn.Id]);

        if (currentGroup != this.previousGroup) {
            var groupCell = new TableBodyCell(table.parent, row.data, this.groupByColumn);
            groupCell.colspan = table.head.main.cells.length;

            if (this.firstRow != null || currentGroup !== "null") {
                const groupRow = new TableRow<TableBodyCell>([groupCell]);
                row.above.push(groupRow);

                if (this.firstRow == null) {
                    this.firstRowProcessed = true;
                }
            }

            this.groupCount += 1;
            this.firstRow = this.firstRow || row;

            this.previousGroup = currentGroup;
        }
    }

    processHeadCell(table: Table, cell: TableHeadCell) {
        if (this.groupByColumn != null) {
            return;
        }

        let groupBy = table.parent.metadata.CustomProperties.tableConfig?.GroupBy;

        if (groupBy == null) {
            return;
        }

        if (cell.metadata.Id === groupBy) {
            cell.hidden = true;
            this.groupByColumn = cell.metadata;
        }
    }
}