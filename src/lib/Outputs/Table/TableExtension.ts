import type { Table, TableHeadCell, TableBodyCell, TableRowGroup } from ".";

/**
 * A table extension allows modifying the table data structure thus affecting
 * how it is rendered. It does so by providing several hooks through which 
 * custom behavior can be injected. The provided hooks are (in order of execution):
 * 1. `init` - invoked once when a table is created.
 * 2. `processHeadCell` - invoked for once for each column (including hidden ones).
 * 3. `processBodyRow` - invoked once for each row.
 * 4. `processTable` - invoked once for the entire table.
 */
export abstract class TableExtension {
    /**
     * The first method that is called when a table is created. It allows 
     * to initialize the extension before the processing begins. This initialization
     * step is necessary in case an extension is reused across multiple table instances.
     * @param table the table on which the extension will be used.
     */
    init(table: Table) { }

    /**
     * This method represents the second phase in the table processing (after the 
     * `init` phase) and is invoked once for each column (including hidden ones).
     * @param table the table on which the extension will be used.
     * @param cell the column that is being processed.
     * @param rows all the data rows.
     */
    processHeadCell(table: Table, cell: TableHeadCell, rows: any[]) { }

    /**
     * This method represents the third phase in the table processing (after the
     * `processHeadCell` phase) and is invoked once for each row.
     * @param table the table on which the extension will be used.
     * @param row the data row on which the extension will be used.
     */
    processBodyRow(table: Table, row: TableRowGroup<TableBodyCell>) { }

    /**
     * This method represents the final phase of the table processing (after the
     * `processBodyRow` phase) and is invoked once for the entire table.
     * @param table the table on which the extension will be used.
     */
    processTable(table: Table) { }
}
