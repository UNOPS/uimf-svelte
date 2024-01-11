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
    private bulkActions: ComponentMetadata[] = [];

    init() {
    }

    processTable(table: Table): void {
        if (this.bulkActions.length > 0) {
            const cells = table.head.main.cells.map(t => {
                const cell = new TableHeadCell(table.field(t.metadata.Id));

                // Copy metadata and mark the bulk input as optional.
                cell.metadata = JSON.parse(JSON.stringify(t.metadata));
                cell.metadata.Required = false;

                // Remove the label.
                cell.label = '';

                const action = this.bulkActions.find(c => c.Id == t.metadata.Id);

                if (action != null) {
                    const bulkInput = controlRegister.createInput({
                        app: table.parent.app,
                        defer: null,
                        form: table.parent.form,
                        metadata: action
                    });

                    bulkInput.controller.on('input:change', () => {
                        bulkInput.controller.getValue().then(function (value) {
                            table.body.forEach(function (row) {
                                var input = table.cell(row, action.Id);
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
            this.bulkActions.push(cell.metadata);
        }
    }
}