import type { Table } from "../Table";
import type { TableBodyCell } from "../TableBodyCell";
import { TableExtension } from "../TableExtension";
import type { TableHeadCell } from "../TableHeadCell";
import type { TableRowGroup } from "../TableRowGroup";
import { FormLink as FormLinkMetadata } from "../../../Infrastructure/uimf";
import type { Row, IValueList } from "../../../Inputs/ValueList.svelte";
import type { TableMetadata } from "../Components/ResultsTable.svelte";

export class BulkAction extends FormLinkMetadata {
    declare public InputFieldValues: {
        [key: string]: any;
        ItemIds: IValueList;
    };

    public refreshLabel() {
        let selectedCount = this.InputFieldValues.ItemIds.Items.length;

        if (selectedCount > 0) {
            this.Label = `${this._originalLabel ?? ''} (${selectedCount})`.trim();
        } else {
            this.disabled = true;
        }
    }

    public addItem(itemId: Row) {
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
    private bulkActionProperty: string | null | undefined;
    public actions: BulkAction[] = [];
    private table!: Table;

    init(table: Table) {
        const metadata = table.parent.metadata as TableMetadata;

        this.bulkActionProperty = metadata.CustomProperties?.bulkActions;
        this.actions = [];
        this.table = table;
    }

    processHeadCell(table: Table, cell: TableHeadCell, rows: any[]): Promise<void> {
        return Promise.resolve();
    }

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
