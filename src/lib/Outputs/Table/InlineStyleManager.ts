export class InlineStyleManager {
    private _styleObject: { [unknown: string]: string; } = {};
    private _style: string | null = null;

    public get styleObject(): { [unknown: string]: string; } {
        return this._styleObject;
    }

    /**
     * Adds a single rule.
     * @param key The style property.
     * @param value The style value.
     */
    public add(key: string, value: string): void {
        this._styleObject[key] = value;
        this.rebuild();
    }

    /**
     * Adds all styles in the provided key-value pairs.
     * @param style key-value pairs of styles to add.
     */
    public addMany(style: Record<string, string>): void {
        for (const key in style) {
            if (style.hasOwnProperty(key)) {
                this._styleObject[key] = style[key];
            }
        }

        this.rebuild();
    }

    /**
     * Resets the styles to the provided key-value pairs.
     * @param style key-value pairs of styles to set.
     */
    public set(style: Record<string, string>): void {
        this._styleObject = style;
        this.rebuild();
    }

    /**
    * The serialized inline style to apply to the row.
    */
    public get style(): string | null {
        return this._style;
    }

    public rebuild(): void {
        this._style = Object.entries(this._styleObject)
            .filter(([key, value]) => value != null && value != "")
            .map(([key, value]) => `${key}: ${value}`)
            .join('; ')
            .trim();
    }
}
