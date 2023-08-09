import type { ComponentMetadata } from "../../../Infrastructure/uimf";
import { Colgroup } from "../Colgroup";
import type { Table } from "../Table";
import type { TableBodyCell } from "../TableBodyCell";
import { TableExtension } from "../TableExtension";
import { TableHeadCell } from "../TableHeadCell";
import TableRow from "../TableRow";
import type { TableRowGroup } from "../TableRowGroup";


export class ColumnGroupsExtension extends TableExtension {
    private columns: TableHeadCell[] = [];
    
    init(table: Table) {
        this.columns = [];
        table.colgroups = [];
    }

    processHeadCell(table: Table, cell: TableHeadCell, rows: any[]) {
        var config = cell.metadata.CustomProperties?.tableColumnConfig;

        if (config != null) {
            this.columns.push(cell);
        }
    }

    processBodyRow(table: Table, row: TableRowGroup<TableBodyCell>) { }

    processTable(table: Table) {
        if (this.columns.length > 0) {
            let cells: TableHeadCell[] = [];
            let previousGroupHeader: TableHeadCell | null = null;
            let previousColgroup: Colgroup | null = null;
            
            table.head.main.cells.forEach(headCell => {
                let thisGroupConfig = headCell.metadata.CustomProperties?.tableColumnConfig;
                let thisGroupLabel = thisGroupConfig?.Group;

                if (thisGroupLabel == null || thisGroupLabel != previousGroupHeader?.label) {
                    let headGroupCell = new TableHeadCell({} as ComponentMetadata);

                    headGroupCell.label = thisGroupLabel || '';
                    headGroupCell.colspan = 1;
                    headGroupCell.cssClass = thisGroupLabel != null ? 'column-group' : '';

                    cells.push(headGroupCell);
                    previousGroupHeader = headGroupCell;

                    // Create new colgroup.
                    var colgroup = new Colgroup();
                    colgroup.span = headGroupCell.colspan;
                    colgroup.cssClass = headGroupCell.cssClass;
                    table.colgroups.push(colgroup);
                    previousColgroup = colgroup;
                } else if (previousGroupHeader != null && previousColgroup != null) {
                    previousGroupHeader.colspan += 1;
                    previousColgroup.span += 1;
                }
            });

            table.head.above.push(new TableRow(cells));
        }
    }
}
