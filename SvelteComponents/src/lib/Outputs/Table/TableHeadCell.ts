import type { ComponentMetadata } from "../../Infrastructure/uimf";

export class TableHeadCell {
    public cssClass: string;
    public label: string;
    public documentation: string;
    public colspan: number = 0;
    public metadata: ComponentMetadata;
    public hidden: boolean | undefined;
    public style: any;

    constructor(metadata: ComponentMetadata) {
        this.metadata = metadata;
        this.documentation = metadata.CustomProperties?.Documentation;
        this.label = metadata.Label;
        this.cssClass = "";
    }
}
