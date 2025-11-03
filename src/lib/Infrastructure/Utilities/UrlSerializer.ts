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
 */
export class UrlSerializer {
	/**
	 * Serializes a complex object to a URL-friendly compressed string.
	 * The output is not human-readable but is compact and URL-safe.
	 * Returns null for null values.
	 */
	public static serialize(value: any): string | null {
		if (value == null) {
			return null;
		}

		const json = JSON.stringify(value);
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
			const decompressed = decompressFromEncodedURIComponent(value);
			if (decompressed != null) {
				return JSON.parse(decompressed) as T;
			}
		} catch (e) {
			// Decompression failed
		}

		return null;
	}
}
