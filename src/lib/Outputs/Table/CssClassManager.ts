
export class CssClassManager {
    private _cssClassObject: { [unknown: string]: boolean; } = {};
    private _cssClass: string | null = null;

    /**
     * Adds a css class to the row.
     * @param classesToAdd The css class or a space-delimited list of css classes to add.
     */
    public addClass(classesToAdd: string | null): void {
        if (classesToAdd == null || classesToAdd == "") {
            return;
        }

        const classesToAddAsArray = classesToAdd.split(" ");

        classesToAddAsArray.forEach(classToAdd => {
            const normalized = classToAdd.trim();
            this._cssClassObject[normalized] = true;
        });

        this.rebuild();
    }

    set(cssClassObject: { [unknown: string]: boolean; }) {
        this._cssClassObject = cssClassObject;
        this.rebuild();
    }

    rebuild(): void {
        this._cssClass = Object.entries(this.cssClassObject)
            .filter(([key, value]) => value === true)
            .map(([key, value]) => key.trim())
            .join(" ")
            .trim();
    }

    /**
     * The css class to apply to <tr> element.
     */
    public get cssClass(): string | null {
        return this._cssClass;
    }

    public get cssClassObject(): { [unknown: string]: boolean; } {
        return this._cssClassObject;
    }
}
