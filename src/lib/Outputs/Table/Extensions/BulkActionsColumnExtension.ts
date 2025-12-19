import type { Table } from "../Table";
import type { TableBodyCell } from "../TableBodyCell";
import { TableExtension } from "../TableExtension";
import type { TableHeadCell } from "../TableHeadCell";
import type { TableRowGroup } from "../TableRowGroup";
import { FormLink as FormLinkMetadata } from "../../../Infrastructure/Metadata/FormLink";
import type { Row, ITableInputData, ITableInputItem } from "../../../Inputs/TableInput/TableInput.svelte";
import type { TableMetadata } from "../Components/ResultsTable.svelte";

export class BulkAction extends FormLinkMetadata {
    declare public InputFieldValues: {
        [key: string]: any;
        ItemIds: ITableInputData;
    };

    public refreshLabel() {
        let selectedCount = this.InputFieldValues.ItemIds.Items.length;

        if (selectedCount > 0) {
            this.Label = `${this._originalLabel ?? ''} (${selectedCount})`.trim();
        } else {
            this.disabled = true;
        }
    }

    public addItem(itemId: ITableInputItem) {
        this.InputFieldValues.ItemIds.Items.push(itemId);
    }

    public static createFrom(action: BulkAction, groupOrderIndex: number): BulkAction {
        var bulkAction: BulkAction = new BulkAction();
        Object.assign(bulkAction, JSON.parse(JSON.stringify(action)));

        bulkAction._originalLabel = bulkAction.Label;
        bulkAction.InputFieldValues.ItemIds.Items = [];
        bulkAction.groupOrderIndex = groupOrderIndex;

        return bulkAction;
    }

    private _originalLabel?: string;
    public disabled: boolean = false;
    public ItemId: any;
    public groupOrderIndex: number = 0;
}

export interface BulkActionGroup {
    orderIndex: number;
    actions: BulkAction[];
}

export class BulkActionsColumnExtension extends TableExtension {
    private bulkActionProperty: string | null | undefined;
    public actions: BulkAction[] = [];
    public actionGroups: BulkActionGroup[] = [];
    private table!: Table;

    init(table: Table) {
        const metadata = table.parent.metadata as TableMetadata;

        this.bulkActionProperty = metadata.Component.Configuration.BulkActions;
        this.actions = [];
        this.actionGroups = [];
        this.table = table;
    }

    processHeadCell(table: Table, cell: TableHeadCell, rows: any[]): Promise<void> {
        return Promise.resolve();
    }

    processBodyRow(table: Table, row: TableRowGroup<TableBodyCell>) {
        if (this.bulkActionProperty == null) {
            return;
        }

        const actionListData = row.data[this.bulkActionProperty] || {};
        const groups = (actionListData.ActionGroups || []).sort((a: any, b: any) => a.OrderIndex - b.OrderIndex);

        for (const group of groups) {
            const groupOrderIndex = group.OrderIndex ?? 0;
            const groupActions: BulkAction[] = group.Actions || [];

            for (const action of groupActions) {
                // Skip non-bulk actions
                if (action.InputFieldValues?.ItemIds == null) {
                    continue;
                }

                // Find existing bulk action by Form and Label
                let bulkAction = this.actions.find((t) => t.Form === action.Form && t.Label === action.Label);

                if (bulkAction == null) {
                    bulkAction = BulkAction.createFrom(action, groupOrderIndex);
                    this.actions.push(bulkAction);

                    // Add to appropriate group
                    let actionGroup = this.actionGroups.find(g => g.orderIndex === groupOrderIndex);
                    if (actionGroup == null) {
                        actionGroup = { orderIndex: groupOrderIndex, actions: [] };
                        this.actionGroups.push(actionGroup);
                    }
                    actionGroup.actions.push(bulkAction);
                }

                if (row.selected) {
                    bulkAction.addItem(action.InputFieldValues.ItemIds.Items[0]);
                }
            }
        }
    }

    processTable(table: Table) {
        for (let action of this.actions) {
            action.refreshLabel();
        }

        // Sort groups by orderIndex
        this.actionGroups.sort((a, b) => a.orderIndex - b.orderIndex);
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
