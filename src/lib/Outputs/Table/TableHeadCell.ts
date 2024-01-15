import type { CreateInputResult } from "../../Infrastructure/ControlRegister";
import type { ComponentMetadata } from "../../Infrastructure/uimf";
import type { IField } from "./IColumn";

export class TableHeadCell {
    public cssClass: string;
    public label: string;
    public documentation: string;
    public colspan: number = 0;
    public metadata: ComponentMetadata;
    public hidden: boolean | undefined;
    public style: any;
    public onClick: Record<string, () => void> = {};
    public readonly isInput: boolean;
    public component?: CreateInputResult | null;

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
        this.cssClass = "";
        this.hidden = metadata.Hidden;
        this.orderIndex = metadata.OrderIndex;
    }

    public click() {
        Object.keys(this.onClick).forEach(key => {
            var handler = this.onClick[key];
            handler();
        });
    }
}
