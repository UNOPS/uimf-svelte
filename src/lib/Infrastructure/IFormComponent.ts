import type { IFieldMetadata } from "./Metadata/IFieldMetadata";

/**
 * Represents an input or an output component.
 */
export interface IFormComponent<TMetadata extends IFieldMetadata = IFieldMetadata> {
    /**
     * Gets metadata for this input/output component.
     */
    readonly metadata: TMetadata;
}