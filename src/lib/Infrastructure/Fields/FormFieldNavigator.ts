import type { Field } from "./Field";

/**
 * Utility class for navigating and resolving field paths within a form's field hierarchy.
 * Supports both absolute paths (starting from form root) and relative paths (from current field).
 */
export class FormFieldNavigator {
    /**
     * Finds a field within a form given a field path and starting context.
     * Path can either be relative (to the parent field) or absolute 
     * (where root is the form).
     * 
     * Examples:
     * - `/response/Contact/FirstName` - absolute path from form output
     * - `/request/Address/City` - absolute path from form inputs
     * - `Sibling` - sibling field
     * - `Sibling/Child` - relative child field access
     * - `../` - grandparent field
     * 
     * @param path The field path to resolve
     * @param currentField The current field context for relative paths
     * @param form The form instance containing the fields
     * @returns The resolved field container or null if not found
     */
    public static resolveFieldPath(
        currentField: Field,
        path: string
    ): Field | null {
        if (!path) {
            return null;
        }

        // Handle absolute paths
        if (path.startsWith('/')) {
            if (!currentField.form) {
                return null;
            }

            // Remove leading slash and split path
            const segments = path.substring(1).split('/').filter(s => s.length > 0);

            if (segments.length > 0) {
                const subsegments = segments.slice(1);

                if (subsegments.length > 0) {
                    if (segments[0] === 'response') {
                        return this.navigateFromRoot(currentField.form.response, subsegments);
                    }
                    else if (segments[0] === 'request') {
                        return this.navigateFromRoot(currentField.form.inputs, subsegments);
                    }
                }
            }

            throw `Invalid field path '${path}'.`;
        }

        // Handle relative paths
        let currentContainer: Field | null = currentField.parent;
        const segments = path.split('/').filter(s => s.length > 0);

        for (const segment of segments) {
            if (segment === '.' || segment === '') {
                // Current directory - stay where we are
                continue;
            } else if (segment === '..') {
                // Parent directory
                if (currentContainer?.parent) {
                    currentContainer = currentContainer.parent;
                } else {
                    currentContainer = null;
                }
            } else {
                // Child field name
                if (currentContainer?.children && currentContainer.children[segment]) {
                    currentContainer = currentContainer.children[segment];
                } else {
                    currentContainer = null;
                }
            }

            if (currentContainer == null) {
                throw `Invalid field path '${path}'.`;
            }
        }

        return currentContainer;
    }

    /**
     * Helper method to navigate from the root container through path segments.
     */
    private static navigateFromRoot(
        rootContainer: Record<string, Field>,
        segments: string[]
    ): Field | null {
        let current: Record<string, Field> | null = rootContainer;
        let currentField: Field | null = null;

        for (const segment of segments) {
            if (!current || !current[segment]) {
                return null;
            }

            currentField = current[segment];
            current = currentField.children;
        }

        return currentField;
    }

    /**
     * Helper method to navigate from a specific container through path segments.
     */
    private static navigateFromContainer(
        container: Field,
        segments: string[]
    ): Field | null {
        let currentField: Field | null = container;

        for (const segment of segments) {
            if (!currentField?.children || !currentField.children[segment]) {
                return null;
            }

            currentField = currentField.children[segment];
        }

        return currentField;
    }
}
