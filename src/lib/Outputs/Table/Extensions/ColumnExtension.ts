import type { ComponentMetadata } from "../../../Infrastructure/uimf";
import { Colgroup } from "../Colgroup";
import type { IField } from "../IColumn";
import type { Table } from "../Table";
import type { TableBodyCell } from "../TableBodyCell";
import { TableExtension } from "../TableExtension";
import { TableHeadCell } from "../TableHeadCell";
import TableRow from "../TableRow";
import type { TableRowGroup } from "../TableRowGroup";

interface ColumnCustomProperty {
    Color: string;
    CssClass: string;
    GroupLabel: string | null;
    GroupOrderIndex: number | null;
}

export class ColumnExtension extends TableExtension {
    private columnWithConfig: TableHeadCell[] = [];
    private columnsWithCssClass: { id: string, cssClass: string }[] = [];

    init(table: Table) {
        this.columnWithConfig = [];
        table.colgroups = [];
        this.columnsWithCssClass = [];
    }

    processHeadCell(table: Table, cell: TableHeadCell, rows: any[]) {
        var config: ColumnCustomProperty = cell.metadata.CustomProperties?.column;

        if (config != null) {
            this.columnWithConfig.push(cell);

            if (config.CssClass != null) {
                this.columnsWithCssClass.push({
                    id: cell.metadata.Id,
                    cssClass: config.CssClass
                });
            }

            if (config.GroupOrderIndex != null) {
                cell.orderIndex = config.GroupOrderIndex * 1000 + cell.metadata.OrderIndex;
            }
        }
    }

    processBodyRow(table: Table, row: TableRowGroup<TableBodyCell>) {
        for (const column of this.columnsWithCssClass) {
            const field = table.field(column.id);

            if (!field.Hidden) {
                const cell = table.cell(row, column.id);
                cell.cssClass = column.cssClass;
            }
        }
    }

    processTable(table: Table) {
        if (this.columnWithConfig.length > 0) {
            let thAboveCells: TableHeadCell[] = [];
            let previousThCell: TableHeadCell | null = null;
            let previousColgroup: Colgroup | null = null;
            let thAboveCell: TableHeadCell | null = null;

            let previousGroupIdentity: string | null = null;

            table.head.main.cells.forEach(headCell => {
                let thisGroupConfig: ColumnCustomProperty = headCell.metadata.CustomProperties?.column;
                let thisGroupLabel = thisGroupConfig?.GroupLabel;

                let thisGroupIdentity =
                    (thisGroupConfig?.GroupOrderIndex ?? '') +
                    (thisGroupConfig?.GroupLabel ?? '');

                if (thisGroupIdentity != previousGroupIdentity) {
                    previousGroupIdentity = thisGroupIdentity;

                    thAboveCell = new TableHeadCell({
                        IsInput: false,
                        Metadata: {}
                    } as IField);

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

                    if (thisGroupConfig?.GroupLabel?.length != null &&
                        thisGroupConfig?.GroupLabel.length > 0) {
                        tdStyle.background = thisGroupConfig.Color || table.parent.app.colorFromString(thisGroupConfig.GroupLabel, {
                            format: 'rgba',
                            alpha: 0.05,
                            luminosity: 'bright'
                        });

                        thStyle.background = table.parent.app.colorFromString(thisGroupConfig.GroupLabel, {
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

                headCell.style = (headCell.style ?? "") + ";" + thAboveCell!.style;
            });

            // If there any column groups, then add the "column group" row.
            if (thAboveCells.length != table.head.main.cells.length &&
                thAboveCells.some(t => t.label?.length > 0)) {
                table.head.above.push(new TableRow(thAboveCells));
            }
        }
    }
}
