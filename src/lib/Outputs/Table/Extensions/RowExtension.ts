
import type { IFieldMetadata } from "../../../Infrastructure/uimf";
import { Table, TableBodyCell, TableHeadCell, TableRowGroup } from "..";
import { TableExtension } from "../TableExtension";
import TableRow from "../TableRow";
import type { IField } from "../IColumn";
import { Color } from "../../../Utilities/Color";

interface RowCustomProperty {
    Color: string;
    GroupBy: string;
    GroupByHeader: string;
    SplitBy: string;
    SplitByStyle: string | null;
    RowCssClass: string | null;
}

export class RowExtension extends TableExtension {
    private previousGroup: string | null = null;
    private previousSplit: string | null = null;
    private rowsProcessed: number = 0;

    /**
     * Field based on which the rows will be grouped. 
     * If null, then rows will not be grouped.
     */
    private groupBy: IFieldMetadata | null = null;

    /**
     * Field based on which will be used as a header for the 
     * rows grouped by <see cref="GroupByHeader"/>.
     */
    private groupByHeader: IField | null = null;

    /**
     * Field based on which we will determine the row's highlight color.
     */
    private color: string | null = null;

    /**
     * Field based on which we will determine the row's "split group".
     * It is similar to `groupBy` except that no header row will be created.
     */
    private splitBy: string | null = null;

    /**
     * Field holding the CSS class to apply to its row.
     */
    private rowCssClass: string | null = null;

    private splitByStyle: string | null = null;
    private firstRow: TableRowGroup<TableBodyCell> | null = null;
    private firstRowProcessed: boolean = false;
    private groupCount: number = 0;

    /**
     * List of actual group rows that were created.
     */
    private groupRows: TableRow<TableBodyCell>[] = [];

    init() {
        this.groupCount = 0;
        this.previousGroup = null;
        this.firstRow = null;
        this.firstRowProcessed = false;
        this.color = null;
        this.splitBy = null;
        this.splitByStyle = null;
        this.rowsProcessed = 0;
        this.groupRows = [];
        this.rowCssClass = null;
    }

    processTable(table: Table): void {
        if (!this.firstRowProcessed && this.groupCount > 1 && this.firstRow != null && this.groupBy != null) {
            const field = table.field(this.groupBy.Id);
            const groupCell = new TableBodyCell(table.parent, this.firstRow.data, field);

            groupCell.colspan = table.head.main.cells.length;

            const groupRow = new TableRow<TableBodyCell>([groupCell]);
            this.firstRow.above.push(groupRow);
        }

        if (this.groupRows.length > 0) {
            const headerBgAsString = table.head.main.cells[0].styleManager.styleObject.background;

            if (headerBgAsString != null) {
                const headerBg = Color.parse(headerBgAsString);

                if (headerBg != null) {
                    // Make the header background color darker and less transparent.
                    // This way the group row stands out and clearly separates the groups.
                    headerBg.alpha *= 2;
                    const groupRowBg = headerBg.adjustBrightness(0.3).toString();

                    for (const groupRow of this.groupRows) {
                        groupRow.styleManager.add('background', groupRowBg);
                    }
                }
            }
        }
    }

    processBodyRow(table: Table, row: TableRowGroup<TableBodyCell>) {
        if (this.groupBy != null) {
            var currentGroup = JSON.stringify(row.data[this.groupBy.Id]);

            if (currentGroup != this.previousGroup) {
                const groupCell = new TableBodyCell(table.parent, row.data, this.groupByHeader!);

                groupCell.colspan = table.head.main.cells.length;

                if (this.firstRow != null || currentGroup !== "null") {
                    const groupRow = new TableRow<TableBodyCell>([groupCell]);
                    row.above.push(groupRow);

                    // Store the group row in private array, so that we
                    // can manipulate them later in an easy way.
                    this.groupRows.push(groupRow);

                    if (this.firstRow == null) {
                        this.firstRowProcessed = true;
                    }
                }

                this.groupCount += 1;
                this.firstRow = this.firstRow || row;

                this.previousGroup = currentGroup;
            }
        }

        if (this.color != null) {
            const seed = row.data[this.color];
            const rowColor = table.parent.app.colorFromString(seed);

            row.main.styleManager.add('border-left', `5px solid ${rowColor}`);
        }

        if (this.splitBy != null) {
            const currentSplit = JSON.stringify(row.data[this.splitBy]);

            if (this.rowsProcessed != 0 && currentSplit != this.previousSplit) {
                const splitByStyle = this.splitByStyle ?? 'default';
                row.main.cssClassManager.addClass('first-row-in-split-by-group ' + splitByStyle);
            }

            this.previousSplit = currentSplit;
        }

        if (this.rowCssClass != null) {
            const rowCssClass = row.data[this.rowCssClass];

            if (rowCssClass != null) {
                row.main.cssClassManager.addClass(rowCssClass);
            }
        }

        this.rowsProcessed += 1;
    }

    processHeadCell(table: Table, cell: TableHeadCell): Promise<void> {
        // We only support one group by column,
        // so if it's already set, we can skip the rest.
        if (this.groupBy != null) {
            return Promise.resolve();
        }

        const rowMetadata: RowCustomProperty = table.parent.metadata.CustomProperties?.row || {};

        if (rowMetadata.GroupBy != null) {
            if (cell.metadata.Id === rowMetadata.GroupBy) {
                // Hide the column, because instead we will render "group row".
                cell.hidden = true;

                this.groupBy = cell.metadata;

                this.groupByHeader = table.fieldOrNull(rowMetadata.GroupByHeader ?? this.groupBy.Id);
            }
        }

        this.color = rowMetadata.Color;
        this.splitBy = rowMetadata.SplitBy;
        this.splitByStyle = rowMetadata.SplitByStyle;
        this.rowCssClass = rowMetadata.RowCssClass;

        return Promise.resolve();
    }
}