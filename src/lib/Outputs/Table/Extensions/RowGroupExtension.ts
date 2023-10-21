
import type { ComponentMetadata } from "../../../Infrastructure/uimf";
import { Table, TableBodyCell, TableHeadCell, TableRowGroup } from "..";
import { TableExtension } from "../TableExtension";
import TableRow from "../TableRow";

interface RowCustomProperty {
    Color: string;
    GroupBy: string;
    GroupByHeader: string;
    SplitBy: string;
}

export class RowGroupExtension extends TableExtension {
    private previousGroup: string | null = null;
    private groupByColumn: ComponentMetadata | null = null;
    private firstRow: TableRowGroup<TableBodyCell> | null = null;
    private firstRowProcessed: boolean = false;
    private groupCount: number = 0;

    init() {
        this.groupCount = 0;
        this.previousGroup = null;
        this.firstRow = null;
        this.firstRowProcessed = false;
    }

    processTable(table: Table): void {
        if (!this.firstRowProcessed && this.groupCount > 1 && this.firstRow != null && this.groupByColumn != null) {
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

        const rowMetadata: RowCustomProperty = table.parent.metadata.CustomProperties?.row || {};

        if (rowMetadata.GroupBy == null) {
            return;
        }

        if (cell.metadata.Id === rowMetadata.GroupBy) {
            cell.hidden = true;
            this.groupByColumn = cell.metadata;
        }
    }
}