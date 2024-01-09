export class SessionStorageVariable<T> {
    private readonly key: string;
    private readonly func: () => Promise<T>;

    constructor(key: string, func: () => Promise<T>) {
        this.key = key;
        this.func = func;
    }

    public async get(): Promise<T | null> {
        let serialized: string | null = sessionStorage.getItem(this.key);

        if (serialized == null) {
            const value = await this.func();
            this.set(value);

            return value;
        }

        return JSON.parse(serialized);
    }

    private set(value: T | null) {
        if (value == null) {
            sessionStorage.removeItem(this.key);
        } else {
            sessionStorage.setItem(this.key, JSON.stringify(value));
        }
    }
}