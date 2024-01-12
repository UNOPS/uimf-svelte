import { defaultControlRegister as controlRegister } from "../../../Infrastructure/ControlRegister";
import type { ComponentMetadata } from "../../../Infrastructure/uimf";
import type { Table } from "../Table";
import type { TableBodyCell } from "../TableBodyCell";
import { TableExtension } from "../TableExtension";
import { TableHeadCell } from "../TableHeadCell";
import TableRow from "../TableRow";
import type { TableRowGroup } from "../TableRowGroup";

interface ValueListInput {
    ShowBulkInput: boolean;
    IfValue: any;
    ShowInput: string;
}

export class ValueListExtension extends TableExtension {
    private bulkInputs: ComponentMetadata[] = [];

    init() {
    }

    processTable(table: Table): void {
        if (this.bulkInputs.length > 0) {
            const cells = table.head.main.cells.map(t => {
                const cell = new TableHeadCell(table.field(t.metadata.Id));

                const bulkInputMetadata = this.bulkInputs.find(c => c.Id == t.metadata.Id)!;

                // Copy metadata and mark the bulk input as optional.
                cell.metadata = bulkInputMetadata;

                if (bulkInputMetadata != null) {
                    const bulkInput = controlRegister.createInput({
                        app: table.parent.app,
                        defer: null,
                        form: table.parent.form,
                        metadata: bulkInputMetadata
                    });

                    bulkInput.controller.on('input:change', () => {
                        bulkInput.controller.getValue().then(function (value) {
                            table.body.forEach(function (row) {
                                var input = table.cell(row, bulkInputMetadata.Id);
                                input.controller.setValue(value);
                            });
                        });
                    });

                    cell.component = bulkInput;
                }

                return cell;
            });

            const row = new TableRow<TableHeadCell>(cells);

            table.head.below.push(row);
        }
    }

    processBodyRow(table: Table, row: TableRowGroup<TableBodyCell>): void {
    }

    processHeadCell(table: Table, cell: TableHeadCell, rows: any[]): void {
        const inputProps: ValueListInput = cell.metadata.CustomProperties?.Input;

        if (inputProps?.ShowBulkInput === true) {
            // Make a copy of the metadata, because we want to modify it
            // to be slightly different from the individual row actions.
            const metadata = JSON.parse(JSON.stringify(cell.metadata));

            // Bulk inputs are always optional.
            metadata.Required = false;

            this.bulkInputs.push(metadata);
        }
    }
}