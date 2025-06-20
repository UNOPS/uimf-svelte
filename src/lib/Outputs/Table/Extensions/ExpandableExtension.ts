import type { ExpandableConfiguration, ExpandableData } from "$lib/Outputs/Expandable/Expandable.svelte";
import { TableBodyCell, type Table, type TableHeadCell, type TableRowGroup } from "..";
import type { IField } from "../IColumn";
import { TableExtension } from "../TableExtension";
import TableRow from "../TableRow";

export class ExpandableExtension extends TableExtension {
    private expandableCells: TableHeadCell[] = [];
    private expanded: Record<string, boolean> = {};

    init(table: Table) {
        this.expandableCells = [];
        this.expanded = {};
    }

    processHeadCell(table: Table, cell: TableHeadCell, rows: any[]): Promise<void> {
        if (cell.metadata.Component.Type === 'expandable') {
            this.expandableCells.push(cell);

            cell.styleManager.add('cursor', 'pointer');

            cell.onClick['expand'] = () => {
                // Toggle the value.
                let show = !this.expanded[cell.metadata.Id];
                this.expanded[cell.metadata.Id] = show;

                rows.forEach(row => {
                    row[cell.metadata.Id]?.show?.(show);
                });
            };
        }

        return Promise.resolve();
    }

    processBodyRow(table: Table, row: TableRowGroup<TableBodyCell>) {
        this.expandableCells.forEach(cell => {
            if (row.data[cell.metadata.Id] == null) {
                return;
            }

            const configuration: ExpandableConfiguration = cell.metadata.Component.Configuration;

            const hiddenField: IField = {
                Metadata: {
                    Component: configuration.Hidden,
                    Id: 'Hidden',
                    Label: '',
                    OrderIndex: 0,
                    Hidden: false
                },
                IsInput: false,
                Hidden: false
            };

            let data: ExpandableData = row.data[cell.metadata.Id];

            var hiddenCell = new TableBodyCell(
                table.parent,
                { 'Hidden': data?.Hidden },
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

                    table.forceRender();
                };
            }
        });
    }
}