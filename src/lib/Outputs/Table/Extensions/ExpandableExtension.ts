import type { ComponentMetadata } from "$lib/Infrastructure/uimf";
import { TableBodyCell, type Table, type TableHeadCell, type TableRowGroup } from "..";
import type { IField } from "../IColumn";
import { TableExtension } from "../TableExtension";
import TableRow from "../TableRow";

interface ICustomProperties {
    ItemTypes: ComponentMetadata[];
}

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

            const customProperties: ICustomProperties = cell.metadata.CustomProperties;
            
            const hiddenField: IField = {
                Metadata: customProperties.ItemTypes[1],
                IsInput: false,
                Hidden: true
            };

            var hiddenCell = new TableBodyCell(
                table.parent,
                { Value: row.data[cell.metadata.Id]?.Hidden },
                hiddenField);

            hiddenCell.colspan = table.head.main.cells.length;

            var hiddenRow = new TableRow<TableBodyCell>([]);
            hiddenRow.cells.push(hiddenCell);
            hiddenRow.append = false;
            hiddenRow.visible = false;

            row.below.push(hiddenRow);

            const controller = table.controller(row, cell.metadata.Id);

            if (controller.value != null) {
                controller.value.handler = function (show: boolean) {
                    hiddenRow.append = true;
                    hiddenRow.visible = show;

                    table.fire("table:data:updated", null);
                };
            }
        });
    }
}