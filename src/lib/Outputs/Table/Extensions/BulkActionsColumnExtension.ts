import type { Table } from "../Table";
import type { TableBodyCell } from "../TableBodyCell";
import { TableExtension } from "../TableExtension";
import type { TableHeadCell } from "../TableHeadCell";
import type { TableRowGroup } from "../TableRowGroup";
import { FormLink as FormLinkMetadata } from "../../../Infrastructure/uimf";

export class BulkAction extends FormLinkMetadata {
    public refreshLabel() {
        let selectedCount = this.InputFieldValues.ItemIds.Items.length;

        if (selectedCount > 0) {
            this.Label = `${this._originalLabel} (${selectedCount})`;
        } else {
            this.disabled = true;
        }
    }

    public addItem(itemId: any) {
        this.InputFieldValues.ItemIds.Items.push(itemId);
    }

    public static createFrom(action: BulkAction): BulkAction {
        var bulkAction: BulkAction = new BulkAction();
        Object.assign(bulkAction, JSON.parse(JSON.stringify(action)));

        bulkAction._originalLabel = bulkAction.Label;
        bulkAction.InputFieldValues.ItemIds.Items = [];

        return bulkAction;
    }

    private _originalLabel?: string;
    public disabled: boolean = false;
    public ItemId: any;
}

export class BulkActionsColumnExtension extends TableExtension {
    private bulkActionProperty!: string;
    public actions: BulkAction[] = [];
    private table!: Table;

    init(table: Table) {
        this.bulkActionProperty = table.parent.metadata.CustomProperties?.bulkActions;
        this.actions = [];
        this.table = table;
    }

    processHeadCell(table: Table, cell: TableHeadCell, rows: any[]) { }
    processBodyRow(table: Table, row: TableRowGroup<TableBodyCell>) {
        if (this.bulkActionProperty == null) {
            return;
        }

        let rowActions: BulkAction[] = (row.data[this.bulkActionProperty] || {}).Actions || [];

        // Bulk actions will have `ItemId` property.
        rowActions = rowActions.filter((t) => t.InputFieldValues.ItemIds != null);

        for (let action of rowActions) {
            let bulkAction = this.actions.find((t) => t.Form === action.Form && t.Label === action.Label);

            if (bulkAction == null) {
                bulkAction = BulkAction.createFrom(action);
                this.actions.push(bulkAction);
            }

            if (row.selected) {
                bulkAction.addItem(action.InputFieldValues.ItemIds.Items[0]);
            }
        }
    }

    processTable(table: Table) {
        for (let action of this.actions) {
            action.refreshLabel();
        }
    }

    selectAllRows(selected: boolean) {
        this.table.body.forEach((row) => {
            row.selected = selected;
        });

        this.refresh();
    }

    refresh() {
        this.init(this.table);
        this.table.body.forEach(t => this.processBodyRow(this.table, t));
        this.processTable(this.table);
    }
}
