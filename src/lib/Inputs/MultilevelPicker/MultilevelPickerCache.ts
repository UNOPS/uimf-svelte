interface CacheEntry {
    data: any;
    timestamp: number;
}

interface CacheConfig {
    ttl: number;
    keyPrefix: string;
}

export class MultilevelPickerCache {
    #config: CacheConfig;

    constructor(config?: Partial<CacheConfig>) {
        this.#config = {
            ttl: 60000,
            keyPrefix: 'multilevel',
            ...config
        };
    }

    async getItem<T>(key: string, getValue: () => Promise<T>): Promise<T> {
        // Try cache first
        const cached = this.#getFromSessionStorage<T>(key);
        if (cached !== null) {
            return cached;
        }

        // Cache miss - get fresh data
        const freshData = await getValue();

        // Store in cache
        this.#storeInSessionStorage(key, freshData);

        return freshData;
    }

    #getFromSessionStorage<T>(key: string): T | null {
        try {
            const item = sessionStorage.getItem(`${this.#config.keyPrefix}-${key}`);
            if (!item) {
                return null;
            }

            const entry: CacheEntry = JSON.parse(item);
            const now = Date.now();

            // Check if expired
            if (now - entry.timestamp > this.#config.ttl) {
                // Auto-cleanup expired entry
                sessionStorage.removeItem(`${this.#config.keyPrefix}-${key}`);
                return null;
            }

            return entry.data as T;
        } catch (error) {
            // Handle JSON parse errors or other storage issues
            // Clean up corrupted entry
            sessionStorage.removeItem(`${this.#config.keyPrefix}-${key}`);
            return null;
        }
    }

    #storeInSessionStorage<T>(key: string, data: T): void {
        try {
            const entry: CacheEntry = {
                data: data,
                timestamp: Date.now()
            };

            sessionStorage.setItem(
                `${this.#config.keyPrefix}-${key}`,
                JSON.stringify(entry)
            );
        } catch (error) {
            // Handle storage quota exceeded or other storage errors
            // Silently fail - cache is optional, don't break functionality
            console.warn('Cache storage failed:', error);
        }
    }
}