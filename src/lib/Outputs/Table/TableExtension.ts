import type { Table, TableHeadCell, TableBodyCell, TableRowGroup } from ".";

export abstract class TableExtension {
    init(table: Table) { }
    processHeadCell(table: Table, cell: TableHeadCell, rows: any[]) { }
    processBodyRow(table: Table, row: TableRowGroup<TableBodyCell>) { }
    processTable(table: Table) { }
}
