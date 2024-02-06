import type { InputController } from "$lib/Infrastructure/InputController";
import { Colgroup } from "../Colgroup";
import type { TableMetadata } from "../Components/ResultsTable.svelte";
import type { IField } from "../IColumn";
import type { Table } from "../Table";
import type { TableBodyCell } from "../TableBodyCell";
import { TableExtension } from "../TableExtension";
import { TableHeadCell } from "../TableHeadCell";
import TableRow from "../TableRow";
import type { TableRowGroup } from "../TableRowGroup";
import type { Controller as PaginatorController } from "../../../Inputs/Paginator.svelte";

interface ColumnCustomProperty {
    Color: string;
    CssClass: string;
    GroupLabel: string | null;
    GroupOrderIndex: number | null;
    SortableBy: string | null;
}

export class ColumnExtension extends TableExtension {
    private columnWithConfig: TableHeadCell[] = [];
    private columnsWithCssClass: { id: string, cssClass: string }[] = [];

    init(table: Table) {
        this.columnWithConfig = [];
        table.colgroups = [];
        this.columnsWithCssClass = [];
    }

    async processHeadCell(table: Table, cell: TableHeadCell, rows: any[]): Promise<void> {
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

            if (config.SortableBy != null) {
                if (table.parent.metadata.Type === 'paginated-data') {
                    let metadata: TableMetadata = table.parent.metadata as TableMetadata;
                    let paginatorName = metadata.CustomProperties.Customizations.Paginator;
                    let paginator: PaginatorController = table.parent.form?.inputs[paginatorName] as PaginatorController;

                    cell.cssClassManager.addClass('sortable');

                    // Set the initial sort direction and corresponding styles.
                    await paginator.getValue().then(value => {
                        if (value?.OrderBy === config.SortableBy) {
                            const ascending = !(value?.Ascending);
                            cell.ascending = ascending;
                        }
                    });

                    cell.onClick['sort'] = function () {
                        paginator.getValue()
                            .then((value) => {
                                return paginator.setValue({
                                    Ascending: !(value?.Ascending),
                                    OrderBy: config.SortableBy,
                                    PageIndex: value?.PageIndex ?? 1,
                                    PageSize: value?.PageSize ?? 10
                                });
                            })
                            .then(() => table.parent.form?.submit());

                    };
                }
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
                    thAboveCell.cssClassManager.addClass(thisGroupLabel != null ? 'column-group' : null);

                    thAboveCells.push(thAboveCell);
                    previousThCell = thAboveCell;

                    // Create new colgroup.
                    var colgroup = new Colgroup();
                    colgroup.span = thAboveCell.colspan;
                    colgroup.cssClassManager.set(thAboveCell.cssClassManager.cssClassObject);
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

                    colgroup.styleManager.set(tdStyle);
                    thAboveCell.styleManager.set(thStyle);
                } else if (previousThCell != null && previousColgroup != null) {
                    previousThCell.colspan += 1;
                    previousColgroup.span += 1;
                }

                headCell.styleManager.addMany(thAboveCell!.styleManager.styleObject);
            });

            // If there any column groups, then add the "column group" row.
            if (thAboveCells.length != table.head.main.cells.length &&
                thAboveCells.some(t => t.label?.length > 0)) {
                table.head.above.push(new TableRow(thAboveCells));
            }
        }
    }
}
