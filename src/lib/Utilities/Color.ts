export class Color {
    R: number;
    G: number;
    B: number;
    alpha: number;

    constructor(R: number, G: number, B: number, alpha: number) {
        this.R = R;
        this.G = G;
        this.B = B;
        this.alpha = alpha;
    }

    static parse(color: string): Color | null {
        if (color == null) {
            return null;
        }

        if (color.startsWith("#")) {
            if (color.length === 7) {
                return new Color(
                    parseInt(color.substring(1, 3), 16),
                    parseInt(color.substring(3, 5), 16),
                    parseInt(color.substring(5, 7), 16),
                    1);
            } else if (color.length === 9) {
                return new Color(
                    parseInt(color.substring(1, 3), 16),
                    parseInt(color.substring(3, 5), 16),
                    parseInt(color.substring(5, 7), 16),
                    parseInt(color.substring(7, 9), 16) / 255);
            }
        } else if (color.startsWith("rgba(")) {
            const parts = color.substring(5, color.length - 1).replace(/ /g, '').split(',');

            return new Color(
                parseInt(parts[0]),
                parseInt(parts[1]),
                parseInt(parts[2]),
                parseFloat(parts[3]));
        } else if (color.startsWith("rgb(")) {
            const parts = color.substring(4, color.length - 1).replace(/ /g, '').split(',');

            return new Color(
                parseInt(parts[0]),
                parseInt(parts[1]),
                parseInt(parts[2]),
                1);
        }

        throw new Error(`Unsupported color string '${color}'.`);
    }

    toString(): string {
        return `rgba(${this.R}, ${this.G}, ${this.B}, ${this.alpha})`;
    }

    adjustBrightness(factor: number): Color {
        return new Color(
            Math.min(255, Math.max(0, this.R * factor)),
            Math.min(255, Math.max(0, this.G * factor)),
            Math.min(255, Math.max(0, this.B * factor)),
            this.alpha);
    }
}