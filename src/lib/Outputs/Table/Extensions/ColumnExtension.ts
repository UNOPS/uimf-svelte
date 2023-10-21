import type { ComponentMetadata } from "../../../Infrastructure/uimf";
import { Colgroup } from "../Colgroup";
import type { Table } from "../Table";
import type { TableBodyCell } from "../TableBodyCell";
import { TableExtension } from "../TableExtension";
import { TableHeadCell } from "../TableHeadCell";
import TableRow from "../TableRow";
import type { TableRowGroup } from "../TableRowGroup";

interface ColumnCustomProperty {
    Color: string;
    CssClass: string;
    Group: string;
}

export class ColumnExtension extends TableExtension {
    private columns: TableHeadCell[] = [];
    private columnsWithCssClass: { id: string, cssClass: string }[] = [];

    init(table: Table) {
        this.columns = [];
        table.colgroups = [];
        this.columnsWithCssClass = [];
    }

    processHeadCell(table: Table, cell: TableHeadCell, rows: any[]) {
        var config: ColumnCustomProperty = cell.metadata.CustomProperties?.column;

        if (config != null) {
            this.columns.push(cell);

            if (config.CssClass != null) {
                this.columnsWithCssClass.push({
                    id: cell.metadata.Id,
                    cssClass: config.CssClass
                });
            }
        }
    }

    processBodyRow(table: Table, row: TableRowGroup<TableBodyCell>) {
        for (const column of this.columnsWithCssClass) {
            const index = table.cellIndex[column.id];
            row.main.cells[index].cssClass = column.cssClass;
        }
    }

    processTable(table: Table) {
        if (this.columns.length > 0) {
            let thAboveCells: TableHeadCell[] = [];
            let previousThCell: TableHeadCell | null = null;
            let previousColgroup: Colgroup | null = null;
            let thAboveCell: TableHeadCell | null = null;

            table.head.main.cells.forEach(headCell => {
                let thisGroupConfig: ColumnCustomProperty = headCell.metadata.CustomProperties?.column;
                let thisGroupLabel = thisGroupConfig?.Group;

                if (thisGroupLabel == null || thisGroupLabel != previousThCell?.label) {
                    thAboveCell = new TableHeadCell({} as ComponentMetadata);

                    thAboveCell.label = thisGroupLabel || '';
                    thAboveCell.colspan = 1;
                    thAboveCell.cssClass = thisGroupLabel != null ? 'column-group' : '';

                    thAboveCells.push(thAboveCell);
                    previousThCell = thAboveCell;

                    // Create new colgroup.
                    var colgroup = new Colgroup();
                    colgroup.span = thAboveCell.colspan;
                    colgroup.cssClass = thAboveCell.cssClass;
                    table.colgroups.push(colgroup);
                    previousColgroup = colgroup;

                    let tdStyle: Record<string, string> = {};
                    let thStyle: Record<string, string> = {};

                    if (thisGroupConfig?.Group != null) {
                        tdStyle.background = thisGroupConfig.Color || table.parent.app.colorFromString(thisGroupConfig.Group, {
                            format: 'rgba',
                            alpha: 0.05,
                            luminosity: 'bright'
                        });

                        thStyle.background = table.parent.app.colorFromString(thisGroupConfig.Group, {
                            format: 'rgba',
                            hue: tdStyle.background,
                            alpha: 0.06,
                            luminosity: 'dark'
                        });
                    }

                    colgroup.style = Object.keys(tdStyle).map(key => `${key}: ${tdStyle[key]}`).join(';');
                    thAboveCell.style = Object.keys(thStyle).map(key => `${key}: ${thStyle[key]}`).join(';');
                } else if (previousThCell != null && previousColgroup != null) {
                    previousThCell.colspan += 1;
                    previousColgroup.span += 1;
                }

                headCell.style = thAboveCell!.style;
            });

            table.head.above.push(new TableRow(thAboveCells));
        }
    }
}
