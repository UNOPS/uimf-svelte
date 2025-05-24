import type { Table, TableHeadCell } from "..";
import { TableExtension } from "../TableExtension";

/**
 * Adds documentation to header cell.
 */
export class DocumentationExtension extends TableExtension {
    processHeadCell(table: Table, cell: TableHeadCell, rows: any[]): Promise<void> {
        cell.documentation = cell.metadata.Documentation ?? null;
        return Promise.resolve();
    }
}