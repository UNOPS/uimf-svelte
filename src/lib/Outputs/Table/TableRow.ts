export default class TableRow<T> {
    constructor(cells: T[]) {
        this.cells = cells;
        this.cssClass = "";
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

    /**
     * The css class to apply to <tr> element.
     */
    public cssClass: string;

    /**
     * The inline style to apply to the row.
     */
    public style: string | null = null;

    /**
     * The style to apply to the row element.
     */
    private styleObject: { [unknown: string]: string } = {};

    /**
     * Adds an inline style for this row.
     * @param key The style key.
     * @param value The style value.
     */
    public addStyle(key: string, value: string): void {
        this.styleObject[key] = value;

        let serialized = "";

        for (const key in this.styleObject) {
            if (this.styleObject.hasOwnProperty(key)) {
                const value = this.styleObject[key];
                serialized += `${key}: ${value}; `;
            }
        }

        this.style = serialized.trim();
    }
}
