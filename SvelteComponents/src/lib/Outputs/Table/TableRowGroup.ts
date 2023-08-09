import TableRow from "./TableRow";

export class TableRowGroup<T> {
    public main: TableRow<T>;
    public above: TableRow<T>[] = [];
    public below: TableRow<T>[] = [];
    public data: any;
    public selected: boolean | undefined;

    constructor(cells: T[], data?: any) {
        this.main = new TableRow<T>(cells);
        this.data = data;
    }
}
