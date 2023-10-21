import type { Table, TableHeadCell } from "..";
import { TableExtension } from "../TableExtension";

/**
 * Adds documentation to header cell.
 */
export class DocumentationExtension extends TableExtension {
    processHeadCell(table: Table, cell: TableHeadCell, rows: any[]) {
        cell.documentation = cell.metadata.CustomProperties?.documentation;
    }
}