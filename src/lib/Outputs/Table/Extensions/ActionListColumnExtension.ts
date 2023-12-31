import type { Table, TableHeadCell } from "..";
import { TableExtension } from "../TableExtension";

/**
 * Hides action-list column if none of the rows have any actions in that column.
 */
export class ActionListColumnExtension extends TableExtension {
    processHeadCell(table: Table, cell: TableHeadCell, rows: any[]) {
        if (cell.metadata.Type === 'action-list') {
            let hasActions = rows.some(t => t[cell.metadata.Id]?.Actions?.length > 0);
            cell.hidden = cell.metadata.Hidden || !hasActions;
        }
    }
}