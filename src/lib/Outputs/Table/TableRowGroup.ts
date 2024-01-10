import type { InputController } from "../../Infrastructure/InputController";
import TableRow from "./TableRow";

export class TableRowGroup<T> {
    /**
     * The main row data to be displayed.
     */
    public main: TableRow<T>;

    /**
     * Rows that are displayed above the main row.
     */
    public above: TableRow<T>[] = [];

    /**
     * Rows that are displayed below the main row.
     */
    public below: TableRow<T>[] = [];

    /**
     * Raw data associated with this row.
     */
    public data: any;

    /**
     * Indicates whether this row is selected for a bulk action.
     */
    public selected: boolean = false;

    /**
     * Indicates whether this row is marked as deleted.
     */
    public deleted: boolean = false;

    /**
     * List of hidden inputs for this row.
     */
    public hiddenInputs: InputController<any>[] = [];

    /**
     * Row index within the table. Because the rows are never
     * actually deleted (i.e. - tables are append-only) this
     * index never changes.
     */
    public readonly index: number = 0;

    constructor(index: number, cells: T[], data?: any) {
        this.main = new TableRow<T>(cells);
        this.data = data;
        this.index = index;
    }
}
