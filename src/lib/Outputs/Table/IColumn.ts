import type { ComponentMetadata } from "../../Infrastructure/uimf";

export interface IField {
    /**
     * Indicates if the field is visible or not. Fields
     * may be hidden by one of the table extensions for various 
     * reasons.
     */
    Hidden: boolean;

    /**
     * Indicates if this is an input or an output field.
     */
    IsInput: boolean;

    /**
     * Metadata describing the input/output field.
     */
    Metadata: ComponentMetadata;
}