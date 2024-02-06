import type { TableExtension } from "./TableExtension";
import { TableBodyCell } from "./TableBodyCell";
import { TableHeadCell } from "./TableHeadCell";
import { TableRowGroup } from "./TableRowGroup";
import type { Colgroup } from "./Colgroup";
import EventSource from '../../Infrastructure/EventSource';
import type { IFormComponent } from '../../Infrastructure/IFormComponent';
import type { IField } from "./IColumn";
import type { InputController } from "$lib/Infrastructure/InputController";
import type { OutputController } from "$lib/Infrastructure/OutputController";
import { defaultControlRegister as controlRegister } from '../../Infrastructure/ControlRegister';
import type { TableMetadata } from "./Components/ResultsTable.svelte";
import type { ValueListMetadata } from "../../Inputs/ValueList.svelte";

export interface ITableOption {
    parent: IFormComponent<TableMetadata | ValueListMetadata>;
    columns: IField[];
    extensions: TableExtension[];
    inputOnChange?: (row: TableRowGroup<TableBodyCell>, cell: InputController<any>) => Promise<void>;
}

interface IIndexedField extends IField {
    /**
     * Fields index within a collection.
     */
    Index: number;
}

/**
 * Data structure that represents a table with rows and columns.
 * This class itself has no UI logic, but is simply a data structure
 * that represents a tabular data in an easy-to-use way.
 * 
 * Each cell inside a table can be either an input or an output field (depending
 * on the column). Some columns may be hidden.
 */
export class Table extends EventSource {
    public head: TableRowGroup<TableHeadCell> = new TableRowGroup<TableHeadCell>(0, []);
    public body: TableRowGroup<TableBodyCell>[] = [];
    public parent: IFormComponent<TableMetadata | ValueListMetadata>;
    public colgroups: Colgroup[] = [];

    /**
     * Dictionary containing all visible fields (aka - columns). This
     * includes both inputs and outputs. The key is the id of the field.
     */
    private columns: Record<string, IIndexedField> = {};

    /**
     * Dictionary containing all hidden input fields.
     * The key is the id of the field.
     */
    private hiddenInputs: Record<string, IIndexedField> = {};

    /**
     * List of extensions that will be applied to this table.
     */
    private extensions: TableExtension[];

    /**
     * The callback to invoke when any of the inputs change.
     */
    private inputOnChange: ((row: TableRowGroup<TableBodyCell>, cell: InputController<any>) => Promise<void>) | null = null;

    /**
     * List of all input and output fields (including hidden ones).
     */
    private fields: IField[];

    constructor(options: ITableOption) {
        super();

        this.parent = options.parent;
        this.extensions = options.extensions;
        this.inputOnChange = options.inputOnChange ?? null;
        this.fields = options.columns;

        this.hiddenInputs = options.columns
            .filter(t => t.Metadata.Hidden)
            .filter(t => t.IsInput)
            .reduce((map: Record<string, IIndexedField>, column, index: number) => {
                map[column.Metadata.Id] = {
                    IsInput: column.IsInput,
                    Metadata: column.Metadata,
                    Index: index,
                    Hidden: column.Metadata.Hidden
                };

                return map;
            }, {});
    }

    public async setData(items: any[]): Promise<void> {
        this.extensions.forEach(c => {
            c.init(this);
        });

        let headCellsPromises = this.fields
            .sort((a, b) => a.Metadata.OrderIndex - b.Metadata.OrderIndex)
            .map((t) => {
                var cell = new TableHeadCell(t);
                const promises = this.extensions.map(c => {
                    return c.processHeadCell(this, cell, items);
                });

                return Promise.all(promises).then(() => cell);
            });

        let headCells = (await Promise.all(headCellsPromises))
            .map(cell => {
                this.field(cell.metadata.Id).Hidden = cell.hidden ?? false;
                return cell;
            })
            .filter(t => !t.hidden)
            .sort((a, b) => a.orderIndex - b.orderIndex);

        this.columns = headCells
            .filter(t => !t.hidden)
            .reduce((map: Record<string, IIndexedField>, column, index: number) => {
                map[column.metadata.Id] = {
                    IsInput: column.isInput,
                    Metadata: column.metadata,
                    Index: index,
                    Hidden: false
                };

                return map;
            }, {});

        this.head = new TableRowGroup<TableHeadCell>(0, headCells);

        const promises = [];

        for (let item of items) {
            var row = this.addRow(item);

            for (let cell of row.main.cells) {
                if (cell.isInput) {
                    const controller = cell.controller as InputController<any>;
                    const promise = controller.setValue(item[cell.controller.metadata.Id]);
                    promises.push(promise);
                } else {
                    const controller = cell.controller as OutputController<any>;
                    controller.setValue(item[cell.controller.metadata.Id]);
                }
            }

            for (let hiddenInput of row.hiddenInputs) {
                const controller = hiddenInput as InputController<any>;
                const promise = controller.setValue(item[hiddenInput.metadata.Id]);
                promises.push(promise);
            }
        }

        this.extensions.forEach(c => {
            c.processTable(this);
        });

        await Promise.all(promises);
    }

    /**
     * Retrieves a column by its id. Only visible columns can be retrieved.
     * @param id column's id.
     * @returns `IColumn` instance.
     */
    column(id: string): IField {
        const column = this.columns[id];

        if (column != null) {
            return column;
        }

        throw new Error(`Column with id '${id}' not found.`);
    }

    field(id: string): IField {
        const field = this.fields.find(t => t.Metadata.Id === id);

        if (field != null) {
            return field;
        }

        throw new Error(`Field with id '${id}' not found.`);
    }

    fieldOrNull(id: string): IField | null {
        return this.fields.find(t => t.Metadata.Id === id) ?? null;
    }

    /**
     * Appends a new row to the table with null data.
     */
    addRow(data: any = {}): TableRowGroup<TableBodyCell> {
        var cells = this.head.main.cells.map((c) => new TableBodyCell(this.parent, data, this.column(c.metadata.Id)));
        var row = new TableRowGroup<TableBodyCell>(this.body.length, cells, data);

        for (let cell of cells) {
            if (cell.isInput) {
                if (this.inputOnChange != null) {
                    const onChange = this.inputOnChange;
                    cell.controller.on("on:change", async () => {
                        await onChange(row, cell.controller as InputController<any>);
                    });
                }
            }
        }

        for (let hiddenInput of Object.values(this.hiddenInputs)) {
            const controller = controlRegister.createInput({
                app: this.parent.app,
                form: this.parent.form,
                metadata: hiddenInput.Metadata,
                defer: null
            }).controller;

            row.hiddenInputs.push(controller as InputController<any>);
        }

        this.extensions.forEach(c => c.processBodyRow(this, row));
        this.body.push(row);

        return row;
    }

    /**
     * Gets cell for the given row. Only visible columns can be retrieved.
     * @param row 
     * @param columnId 
     */
    cell(row: TableRowGroup<TableBodyCell>, columnId: string): TableBodyCell {
        let column = this.columns[columnId];

        if (column != null) {
            return row.main.cells[column.Index];
        }

        throw new Error(`Column with id '${columnId}' not found.`);
    }

    /**
     * Gets input/output controller for the given row and column.
     * Controllers for hidden columns can be retrieved as well.
     * @param row 
     * @param columnId 
     */
    controller(row: TableRowGroup<TableBodyCell>, columnId: string): InputController<any> | OutputController<any> {
        let column = this.columns[columnId];

        if (column != null) {
            return row.main.cells[column.Index].controller;
        }

        column = this.hiddenInputs[columnId];

        if (column != null) {
            return row.hiddenInputs[column.Index];
        }

        throw new Error(`Column with id '${columnId}' not found.`);
    }

    /**
     * Forces the table to re-render.
     */
    forceRender() {
        this.fire('table:data:updated', null);
    }
}
