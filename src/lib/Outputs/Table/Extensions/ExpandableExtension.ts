import { TableBodyCell, type Table, type TableHeadCell, type TableRowGroup } from "..";
import { TableExtension } from "../TableExtension";
import TableRow from "../TableRow";

export class ExpandableExtension extends TableExtension {
    private expandableCells: TableHeadCell[] = [];
    private expanded: Record<string, boolean> = {};

    init(table: Table) {
        this.expandableCells = [];
        this.expanded = {};
    }

    processHeadCell(table: Table, cell: TableHeadCell, rows: any[]) {
        if (cell.metadata.Type === 'expandable') {
            this.expandableCells.push(cell);

            cell.style = cell.style ?? "";
            cell.style += "; cursor: pointer;";

            cell.onClick['expand'] = () => {
                // Toggle the value.
                let show = !this.expanded[cell.metadata.Id];
                this.expanded[cell.metadata.Id] = show;

                rows.forEach(row => {
                    row[cell.metadata.Id]?.show?.(show);
                });
            };
        }
    }

    processBodyRow(table: Table, row: TableRowGroup<TableBodyCell>) {
        this.expandableCells.forEach(cell => {
            if (row.data[cell.metadata.Id] == null) {
                return;
            }

            var hiddenCell = new TableBodyCell(
                table.parent,
                { Value: row.data[cell.metadata.Id]?.Hidden },
                cell.metadata.CustomProperties.ItemTypes[1]);

            hiddenCell.colspan = table.head.main.cells.length;

            var hiddenRow = new TableRow<TableBodyCell>([]);
            hiddenRow.cells.push(hiddenCell);
            hiddenRow.append = false;
            hiddenRow.visible = false;

            row.below.push(hiddenRow);

            var index = table.cellIndex[cell.metadata.Id];
            var mainCell = row.main.cells[index];

            if (mainCell.controller.value != null) {
                mainCell.controller.value.handler = function (show: boolean) {
                    hiddenRow.append = true;
                    hiddenRow.visible = show;

                    table.fire("table:data:updated", null);
                };
            }
        });
    }
}