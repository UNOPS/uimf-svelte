import type { CreateInputResult } from "../../Infrastructure/ControlRegister";
import type { ComponentMetadata } from "../../Infrastructure/uimf";
import { CssClassManager } from "./CssClassManager";
import type { IField } from "./IColumn";
import { InlineStyleManager } from "./InlineStyleManager";

export class TableHeadCell {
    public cssClassManager: CssClassManager = new CssClassManager();
    public styleManager: InlineStyleManager = new InlineStyleManager();

    public label: string;
    public documentation: string;
    public colspan: number = 0;
    public metadata: ComponentMetadata;
    public hidden: boolean | undefined;
    public onClick: Record<string, () => void> = {};
    public readonly isInput: boolean;
    public component?: CreateInputResult | null;

    /**
     * Indicates if the data is sorted by this column in ascending (true) or descending (false) order.
     * If null or undefined, then the data is not sorted by this column.
     */
    public ascending?: boolean;

    /**
     * Defines the order index for this column inside the table.
     * By default it will be set to the value of `Metadata.OrderIndex`,
     * but can be changed by extensions.
     */
    public orderIndex: number;

    constructor(column: IField) {
        const metadata = column.Metadata;

        this.isInput = column.IsInput;
        this.metadata = metadata;
        this.documentation = metadata.CustomProperties?.Documentation;
        this.label = metadata.Label;
        this.hidden = metadata.Hidden;
        this.orderIndex = metadata.OrderIndex;
    }

    public click() {
        Object.keys(this.onClick).forEach(key => {
            var handler = this.onClick[key];
            handler();
        });
    }

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

