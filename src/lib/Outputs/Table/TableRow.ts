import { CssClassManager } from "./CssClassManager";
import { InlineStyleManager } from "./InlineStyleManager";

export default class TableRow<T> {
    public cssClassManager: CssClassManager = new CssClassManager();
    public styleManager: InlineStyleManager = new InlineStyleManager();

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

    /**
     * The css class to apply to <tr> element.
     */
    public get cssClass(): string | null {
        return this.cssClassManager.cssClass;
    }

    /**
    * The inline style to apply to the row.
    */
    public get style(): string | null {
        return this.styleManager.style;
    }
}
