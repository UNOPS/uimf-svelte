import type { IComponent } from "../Metadata/IComponent";
import type { IOutputFieldMetadata } from "../Metadata/IOutputFieldMetadata";
import uuid from "./uuid";

export class OutputFieldMetadataFactory {
    public static fromComponent<TConfig = null>(component: IComponent<TConfig>, options?: { Id: string; }): IOutputFieldMetadata<TConfig> {
        return {
            Component: component,
            Hidden: false,
            Id: options?.Id ?? uuid(),
            Label: '',
            OrderIndex: 0
        } as IOutputFieldMetadata<TConfig>;
    }
}
