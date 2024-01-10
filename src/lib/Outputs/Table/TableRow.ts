export default class TableRow<T> {
    constructor(cells: T[]) {
        this.cells = cells;
    }

    public cells: T[] = [];
    
    /**
     * Indicates if the row should be appended to DOM or not.
     */
    public append: boolean = true;

    /**
     * Indicates if the row should be visible.
     */
    public visible: boolean = true;
}
