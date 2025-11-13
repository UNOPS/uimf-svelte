import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

/**
 * Utility for serializing and deserializing complex objects for URL parameters.
 * Uses compression to create compact, URL-friendly strings that are not human-readable.
 *
 * This serializer is designed for complex objects (objects, arrays, nested structures)
 * where the resulting compressed string is shorter and cleaner-looking in URLs compared
 * to JSON.stringify with URL encoding.
 *
 * Trade-off: Values are not human-readable but URLs are significantly shorter and
 * cleaner-looking (no percent-encoded characters like %7B, %22, etc.).
 *
 * For debugging, set USE_PLAIN_JSON to true to use readable JSON encoding instead of compression.
 */
export class UrlSerializer {
	/**
	 * Set to true to use plain JSON encoding for debugging (human-readable URLs).
	 * Set to false to use compression for production (compact URLs).
	 */
	private static readonly USE_PLAIN_JSON = true;

	/**
	 * Filters out top-level properties with null or undefined values from an object.
	 * Returns the original value if it's not a plain object.
	 */
	private static filterNullProperties(value: any): any {
		// Only filter plain objects (not arrays, null, or primitives)
		if (value == null || typeof value !== 'object' || Array.isArray(value)) {
			return value;
		}

		const filtered: any = {};
		for (const key in value) {
			if (value.hasOwnProperty(key) && value[key] != null) {
				filtered[key] = value[key];
			}
		}
		return filtered;
	}

	/**
	 * Serializes a complex object to a URL-friendly string.
	 * When USE_PLAIN_JSON is true: Uses plain JSON encoding for readability.
	 * When USE_PLAIN_JSON is false: Uses compression for compact URLs.
	 * Returns null for null values.
	 */
	public static serialize(value: any): string | null {
		if (value == null) {
			return null;
		}

		// Filter out null/undefined properties at the top level
		const filtered = this.filterNullProperties(value);
		const json = JSON.stringify(filtered);

		if (this.USE_PLAIN_JSON) {
			return json;
		}

		return compressToEncodedURIComponent(json);
	}

	/**
	 * Deserializes a URL parameter string back to its original value.
	 * Returns null if deserialization fails.
	 */
	public static deserialize<T = any>(value: string | null): T | null {
		if (value == null || value === 'null') {
			return null;
		}

		try {
			if (this.USE_PLAIN_JSON) {
				return JSON.parse(value) as T;
			} else {
				const decompressed = decompressFromEncodedURIComponent(value);
				if (decompressed != null) {
					return JSON.parse(decompressed) as T;
				}
			}
		} catch (e) {
			// Deserialization failed
		}

		return null;
	}
}
