import { ActionListData } from "../../../Outputs/ActionList/ActionList.svelte";
import type { Table, TableHeadCell } from "..";
import { TableExtension } from "../TableExtension";

/**
 * Hides action-list column if none of the rows have any actions in that column.
 */
export class ActionListColumnExtension extends TableExtension {
    processHeadCell(table: Table, cell: TableHeadCell, rows: any[]): Promise<void> {
        if (cell.metadata.Component.Type === 'action-list') {
            let hasActions = rows.some(t => {
                const item: ActionListData = t[cell.metadata.Id];
                return item?.ActionGroups?.some(g => g.Actions?.length > 0) ?? false;
            });

            cell.hidden = cell.metadata.Hidden || !hasActions;
        }

        return Promise.resolve();
    }
}