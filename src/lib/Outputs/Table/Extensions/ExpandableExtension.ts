import { TableBodyCell, type Table, type TableHeadCell, type TableRowGroup } from "..";
import { TableExtension } from "../TableExtension";
import TableRow from "../TableRow";

export class ExpandableExtension extends TableExtension {
    private expandableCells: TableHeadCell[] = [];
    private cellIndex: Record<string, number> = {};

    init(table: Table) {
        this.expandableCells = [];
    }

    processHeadCell(table: Table, cell: TableHeadCell, rows: any[]) {
        if (cell.metadata.Type === 'expandable') {
            this.expandableCells.push(cell);
        }
    }

    processBodyRow(table: Table, row: TableRowGroup<TableBodyCell>) {
        this.expandableCells.forEach(cell => {
            var hiddenCell = new TableBodyCell(
                table.parent,
                row.data,//[cell.metadata.Id],
                cell.metadata.CustomProperties.ItemTypes[1]);

            hiddenCell.colspan = table.head.main.cells.length;

            var hiddenRow = new TableRow<TableBodyCell>([]);
            hiddenRow.cells.push(hiddenCell);
            hiddenRow.append = false;
            hiddenRow.visible = false;

            row.below.push(hiddenRow);

            if (this.cellIndex[cell.metadata.Id] == null) {
                this.cellIndex[cell.metadata.Id] = row.main.cells.findIndex(t => t.controller.metadata.Id === cell.metadata.Id);
            }

            var index = this.cellIndex[cell.metadata.Id];
            var mainCell = row.main.cells[index];

            if(mainCell.controller.value != null){
                mainCell.controller.value.handler = function (show: boolean) {
                    hiddenRow.append = true;
                    hiddenRow.visible = show;
    
                    table.fire("table:data:updated", null);
                };
            }
        });
    }
}