import { InputController } from '../../Infrastructure/InputController';
import { IGroups } from './IGroups';

export class GroupsController extends InputController<IGroups> {
    public getValue(): Promise<IGroups | null> {
        return Promise.resolve(this.value);
    }

    public deserialize(value: string | null): Promise<IGroups | null> {
        if (value == null) {
            return Promise.resolve(null);
        }

        return Promise.resolve(JSON.parse(value));
    }

    public serialize(value: IGroups | null): string | null {
        if (value == null) {
            return null;
        }

        return JSON.stringify(value);
    }
} 