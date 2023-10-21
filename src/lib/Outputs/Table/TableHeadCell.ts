import type { ComponentMetadata } from "../../Infrastructure/uimf";

export class TableHeadCell {
    public cssClass: string;
    public label: string;
    public documentation: string;
    public colspan: number = 0;
    public metadata: ComponentMetadata;
    public hidden: boolean | undefined;
    public style: any;
    public onClick: Record<string, () => void> = {};

    constructor(metadata: ComponentMetadata) {
        this.metadata = metadata;
        this.documentation = metadata.CustomProperties?.Documentation;
        this.label = metadata.Label;
        this.cssClass = "";
        this.hidden = metadata.Hidden;
    }

    public click() {
        Object.keys(this.onClick).forEach(key => {
            var handler = this.onClick[key];
            handler();
        });
    }
}
