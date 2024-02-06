import { CssClassManager } from "./CssClassManager";
import { InlineStyleManager } from "./InlineStyleManager";

export class Colgroup {
    public span: number = 1;
    public cssClassManager: CssClassManager = new CssClassManager();
    public styleManager: InlineStyleManager = new InlineStyleManager();

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