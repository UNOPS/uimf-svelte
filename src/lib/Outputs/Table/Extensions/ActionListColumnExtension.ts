import type { Table, TableHeadCell } from "..";
import { TableExtension } from "../TableExtension";

export class ActionListColumnExtension extends TableExtension {
    processHeadCell(table: Table, cell: TableHeadCell, rows: any[]) {
        if (cell.metadata.Type === 'action-list') {
            let hasActions = rows.some(t => t[cell.metadata.Id]?.Actions?.length > 0);
            cell.hidden = !hasActions;
        }
    }
}