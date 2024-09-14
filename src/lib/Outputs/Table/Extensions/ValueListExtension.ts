import type { InputController } from "../../../Infrastructure/InputController";
import { defaultControlRegister as controlRegister } from "../../../Infrastructure/ControlRegister";
import type { IInputFieldMetadata } from "../../../Infrastructure/uimf";
import type { Table } from "../Table";
import type { TableBodyCell } from "../TableBodyCell";
import { TableExtension } from "../TableExtension";
import { TableHeadCell } from "../TableHeadCell";
import TableRow from "../TableRow";
import type { TableRowGroup } from "../TableRowGroup";

interface ValueListInput {
    ShowBulkInput: boolean;
    DependentInputShownIfValueEqualsTo: any;
    DependentInput: string | null;
}

interface IInputCondition {
    DependentInputShownIfValueEqualsTo: any;
    DependentInput: string;
    MetadataId: string;
}

export class ValueListExtension extends TableExtension {
    private bulkInputs: Record<string, IInputFieldMetadata> = {};
    private inputConditions: IInputCondition[] = [];

    init() {
    }

    processTable(table: Table): void {
        if (Object.entries(this.bulkInputs).length > 0) {
            const cells = table.head.main.cells.map(t => {
                const bulkInputMetadata = this.bulkInputs[t.metadata.Id];

                if (bulkInputMetadata == null) {
                    // Copy the original metadata and remove the label.
                    const metadata = JSON.parse(JSON.stringify(t.metadata));
                    metadata.Label = "";

                    return new TableHeadCell({
                        Hidden: false,
                        IsInput: false,
                        Metadata: metadata
                    });
                }

                const cell = new TableHeadCell(table.field(t.metadata.Id));

                // Copy metadata and mark the bulk input as optional.
                cell.metadata = bulkInputMetadata;

                if (bulkInputMetadata != null) {
                    const bulkInput = controlRegister.createInput({
                        app: table.parent.app,
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
            row.cssClassManager.addClass('bulk-input-row');

            table.head.below.push(row);
        }
    }

    processBodyRow(table: Table, row: TableRowGroup<TableBodyCell>): void {
        for (const condition of this.inputConditions) {
            const thisInput = table.cell(row, condition.MetadataId).controller as InputController<any>;
            const dependentInput = table.cell(row, condition.DependentInput);

            thisInput.on('input:change', async () => {
                const thisInputValue = await thisInput.getValue();
                const conditionalValue = row.data[condition.DependentInputShownIfValueEqualsTo];

                const hidden = JSON.stringify(thisInputValue) != JSON.stringify(conditionalValue);

                if (hidden != dependentInput.hidden) {
                    dependentInput.hidden = hidden;
                    table.fire('input:change', {});
                }
            });
        }
    }

    processHeadCell(table: Table, cell: TableHeadCell, rows: any[]): Promise<void> {
        const inputProps: ValueListInput = cell.metadata.CustomProperties?.Input;

        if (inputProps != null) {
            if (!cell.isInput) {
                throw new Error(
                    'Input configuration cannot be added to field ' +
                    `'${cell.metadata.Id}' because it is not an input.`);
            }

            if (inputProps.ShowBulkInput) {
                // Make a copy of the metadata, because we want to modify it
                // to be slightly different from the individual row actions.
                const metadata = JSON.parse(JSON.stringify(cell.metadata));

                // Bulk inputs are always optional.
                metadata.Required = false;

                this.bulkInputs[metadata.Id] = metadata;
            }

            if (inputProps.DependentInput != null) {
                this.inputConditions.push({
                    MetadataId: cell.metadata.Id,
                    DependentInput: inputProps.DependentInput,
                    DependentInputShownIfValueEqualsTo: inputProps.DependentInputShownIfValueEqualsTo
                });
            }
        }

        return Promise.resolve();
    }
}