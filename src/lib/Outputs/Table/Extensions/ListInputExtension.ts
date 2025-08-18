import type { IListInputConfiguration } from '../../../Inputs/ListInput/ListInput.svelte';
import type { Table } from "../Table";
import type { TableBodyCell } from "../TableBodyCell";
import { TableExtension } from "../TableExtension";
import type { TableHeadCell } from "../TableHeadCell";
import type { TableRowGroup } from "../TableRowGroup";

export class ListInputExtension extends TableExtension {
    init() {
    }

    processTable(table: Table): void {
    }

    processBodyRow(table: Table, row: TableRowGroup<TableBodyCell>): void {

    }

    processHeadCell(table: Table, cell: TableHeadCell, rows: any[]): Promise<void> {
        let config: IListInputConfiguration = table.parent.metadata.Component.Configuration as IListInputConfiguration;

        if (cell.metadata.Id === config.Header) {
            // Hide the cell. It will be rendered manually.
            cell.hidden = true;
        }

        return Promise.resolve();
    }
}