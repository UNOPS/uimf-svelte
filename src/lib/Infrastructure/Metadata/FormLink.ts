/**
 * Represents a reference to a form.
 */
export class FormLink {
    /**
     * Gets or sets name of the form to link to.
     */
    public Form!: string;

    /**
     * Gets or sets values for the input fields of the form (i.e. - <see cref="FormMetadata.InputFields"/>).
     */
    public InputFieldValues?: any;

    /**
     * Gets or sets label to be shown on the client when rendering the link.
     */
    public Label?: string;

    /**
     * Indicates link's behavior on user interaction.
     */
    Action?: string;
}
