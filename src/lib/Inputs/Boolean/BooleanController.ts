import { InputController } from '../../Infrastructure/InputController';
import type { IInputFieldMetadata } from "$lib/Infrastructure/Metadata/IInputFieldMetadata";
import type { BooleanConfiguration } from './BooleanConfiguration';

export class BooleanController extends InputController<boolean, IInputFieldMetadata<BooleanConfiguration>> {
    public getValue(): Promise<boolean | null> {
        const result = this.deserialize(this.value?.toString() ?? null);
        return Promise.resolve(result);
    }

    public deserialize(value: string | null): Promise<boolean | null> {
        if (!this.metadata.Required && (value == null || value === '')) {
            return Promise.resolve(null);
        }

        const result = value == null ? false : value.toLowerCase() === 'true';

        return Promise.resolve(result);
    }

    public serialize(value: boolean | null): string | null {
        if (value == null) {
            return null;
        }

        if (this.metadata.Required === true) {
            return value ? 'true' : null;
        }

        return value ? 'true' : 'false';
    }
} 