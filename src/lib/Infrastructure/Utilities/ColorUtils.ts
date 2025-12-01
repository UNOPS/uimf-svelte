import randomColor from "randomcolor";

export interface IColorOptions {
    hue?: number | string | undefined;
    luminosity?: "bright" | "light" | "dark" | "random" | undefined;
    format?: "hsvArray" | "hslArray" | "hsl" | "hsla" | "rgbArray" | "rgb" | "rgba" | "hex" | undefined;
    alpha?: number | undefined;
}

export class ColorUtils {
    private static colorCache: { [key: string]: string; } = {};

    static #hashCode(value: string) {
        if (value == null) {
            return 0;
        }

        let hash = 0;
        let i: number;
        let chr: number;

        if (value.length === 0) {
            return hash;
        }

        for (i = 0; i < value.length; i++) {
            chr = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }

        return Math.abs(hash);
    }

    static colorFromString(str: string, options?: IColorOptions | null): string {
        if (ColorUtils.colorCache[str] != null && options == null) {
            return ColorUtils.colorCache[str];
        }

        var hash = ColorUtils.#hashCode(str);

        if (hash === 0) {
            return '#f8f8f8';
        }

        let effectiveOptions = Object.assign({}, {
            seed: hash,
            format: 'hex'
        }, options);

        ColorUtils.colorCache[str] = randomColor(effectiveOptions);

        return ColorUtils.colorCache[str];
    }
}
