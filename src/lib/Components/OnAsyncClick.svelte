<script context="module" lang="ts">
	export type AsyncClickHandler = (event: MouseEvent) => Promise<void>;

	interface BackgroundStyle {
		Image: string;
		Size: string;
		Position: string;
		Repeat: string;
		Color: string;
	}

	function getBackgroundStyle(node: HTMLButtonElement): BackgroundStyle {
		return {
			Image: node.style.backgroundImage,
			Size: node.style.backgroundSize,
			Position: node.style.backgroundPosition,
			Repeat: node.style.backgroundRepeat,
			Color: node.style.backgroundColor
		};
	}

	function setBackgroundStyle(node: HTMLButtonElement, styles: BackgroundStyle): void {
		node.style.backgroundImage = styles.Image;
		node.style.backgroundSize = styles.Size;
		node.style.backgroundPosition = styles.Position;
		node.style.backgroundRepeat = styles.Repeat;
		node.style.backgroundColor = styles.Color;
	}

	function applyLoadingStyles(node: HTMLButtonElement, originalBgColor: string): boolean {
		const computed = getComputedStyle(node);
		const computedBgImage = computed.backgroundImage;

		node.style.backgroundColor = originalBgColor;

		const progressBarColor = deriveProgressBarColor(originalBgColor);
		const progressBar = `linear-gradient(to right, ${progressBarColor}, ${progressBarColor})`;

		const hasExistingBg = !!(computedBgImage && computedBgImage !== 'none');
		node.style.backgroundImage = hasExistingBg ? `${progressBar}, ${computedBgImage}` : progressBar;
		node.style.backgroundPosition = hasExistingBg ? 'left center, center' : 'left center';
		node.style.backgroundRepeat = hasExistingBg ? 'no-repeat, repeat' : 'no-repeat';

		return hasExistingBg;
	}

	function startLoadingAnimation(node: HTMLButtonElement, originalBgColor: string): () => void {
		const originalStyles = getBackgroundStyle(node);

		const startTime = performance.now();
		let animationId: number;
		let stopped = false;

		const hasExistingBg = applyLoadingStyles(node, originalBgColor);

		function updateProgress(progress: number) {
			const sizeValue = `${progress * 100}% 100%`;
			node.style.backgroundSize = hasExistingBg ? `${sizeValue}, auto` : sizeValue;
		}

		function animate() {
			if (stopped) return;

			const elapsed = performance.now() - startTime;

			// Logarithmic progression: 85% at 1s, 90% at 2s, 95% at 3s, then continues slowly without reaching 100%
			const seconds = elapsed / 1000;
			const progress = Math.log(1 + seconds * 6) / Math.log(1 + seconds * 6 + 6);
			updateProgress(progress);

			animationId = requestAnimationFrame(animate);
		}

		updateProgress(0);
		animationId = requestAnimationFrame(animate);

		return () => {
			stopped = true;
			cancelAnimationFrame(animationId);
			updateProgress(1);

			setTimeout(() => {
				setBackgroundStyle(node, originalStyles);
			}, 150);
		};
	}

	/**
	 * Helper function to convert hex, short hex, and basic named colors to an RGBA string.
	 * This is a simplified approach supporting only the most common inputs.
	 */
	function toRgb(color: string): string | null {
		// 1. Basic Named Colors (Simplified Map)
		const namedColors: { [key: string]: string } = {
			red: 'rgb(255, 0, 0)',
			blue: 'rgb(0, 0, 255)',
			green: 'rgb(0, 128, 0)',
			yellow: 'rgb(255, 255, 0)',
			white: 'rgb(255, 255, 255)',
			black: 'rgb(0, 0, 0)',
			gray: 'rgb(128, 128, 128)'
		};
		const lowerColor = color.toLowerCase();
		if (namedColors[lowerColor]) {
			return namedColors[lowerColor];
		}

		// 2. Hex Colors (#RGB or #RRGGBB)
		const hexMatch = color.match(/^#?([a-f\d]{3})$/i);
		const fullHexMatch = color.match(/^#?([a-f\d]{6})$/i);

		if (hexMatch) {
			// Handle #RGB (short hex)
			const hex = hexMatch[1];
			const r = parseInt(hex[0] + hex[0], 16);
			const g = parseInt(hex[1] + hex[1], 16);
			const b = parseInt(hex[2] + hex[2], 16);
			return `rgb(${r}, ${g}, ${b})`;
		} else if (fullHexMatch) {
			// Handle #RRGGBB (full hex)
			const hex = fullHexMatch[1];
			const r = parseInt(hex.substring(0, 2), 16);
			const g = parseInt(hex.substring(2, 4), 16);
			const b = parseInt(hex.substring(4, 6), 16);
			return `rgb(${r}, ${g}, ${b})`;
		}

		// 3. Already RGBA/RGB
		if (color.startsWith('rgb')) {
			return color;
		}

		// Unrecognized format
		return null;
	}

	// Brightness thresholds for adaptive progress bar color calculation
	const BRIGHTNESS_THRESHOLD_LIGHT = 200; // Above this is considered a light background
	const BRIGHTNESS_THRESHOLD_DARK = 55; // Below this is considered a dark background
	const DARKEN_FACTOR_LIGHT = 0.4; // Light backgrounds need strong darkening for visibility
	const LIGHTEN_FACTOR_DARK = 0.6; // Dark backgrounds need moderate lightening
	const DARKEN_FACTOR_COLORED = 0.7; // Colored backgrounds need subtle darkening
	const PROGRESS_BAR_OPACITY = 0.4; // Opacity for the progress bar overlay

	/**
	 * Derives an appropriate progress bar color from the button's background color.
	 * Now supports hex codes and basic named colors (red, blue, green, etc.).
	 * Uses adaptive brightness handling to ensure visibility.
	 */
	function deriveProgressBarColor(bgColor: string): string {
		// 1. Convert input color to RGB/RGBA format
		const rgbColor = toRgb(bgColor);

		if (!rgbColor) {
			// Fallback if the color format is not supported or parsing fails
			return `rgba(128, 128, 128, ${PROGRESS_BAR_OPACITY})`;
		}

		// 2. Parse RGB values from the normalized color string
		const rgbMatch = rgbColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);

		if (!rgbMatch) {
			// Should not happen after toRgb conversion, but kept as a safeguard
			return `rgba(128, 128, 128, ${PROGRESS_BAR_OPACITY})`;
		}

		const r = parseInt(rgbMatch[1], 10);
		const g = parseInt(rgbMatch[2], 10);
		const b = parseInt(rgbMatch[3], 10);

		// 3. Calculate perceived brightness using luminance formula
		// Luminance formula: L = 0.299*R + 0.587*G + 0.114*B
		const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

		let newR: number, newG: number, newB: number;

		// 4. Adaptive Brightness Logic
		if (brightness > BRIGHTNESS_THRESHOLD_LIGHT) {
			// Light background: darken significantly for visibility
			newR = Math.round(r * DARKEN_FACTOR_LIGHT);
			newG = Math.round(g * DARKEN_FACTOR_LIGHT);
			newB = Math.round(b * DARKEN_FACTOR_LIGHT);
		} else if (brightness < BRIGHTNESS_THRESHOLD_DARK) {
			// Dark background: lighten by interpolating towards white
			newR = Math.round(255 - (255 - r) * LIGHTEN_FACTOR_DARK);
			newG = Math.round(255 - (255 - g) * LIGHTEN_FACTOR_DARK);
			newB = Math.round(255 - (255 - b) * LIGHTEN_FACTOR_DARK);
		} else {
			// Colored background: darken subtly
			newR = Math.round(r * DARKEN_FACTOR_COLORED);
			newG = Math.round(g * DARKEN_FACTOR_COLORED);
			newB = Math.round(b * DARKEN_FACTOR_COLORED);
		}

		// 5. Return the new color with configured opacity
		return `rgba(${newR}, ${newG}, ${newB}, ${PROGRESS_BAR_OPACITY})`;
	}

	function setProgressCursor(node: HTMLButtonElement): () => void {
		const originalCursor = node.style.cursor;
		node.style.cursor = 'progress';

		return () => {
			node.style.cursor = originalCursor;
		};
	}

	export function onAsyncClick(node: HTMLButtonElement, handler: AsyncClickHandler) {
		let currentHandler = handler;

		async function handleClick(event: MouseEvent) {
			if (node.disabled) return;

			const originalBgColor = getComputedStyle(node).backgroundColor;

			node.disabled = true;

			const restoreCursor = setProgressCursor(node);
			const stopLoading = startLoadingAnimation(node, originalBgColor);

			try {
				await currentHandler(event);
			} finally {
				node.disabled = false;

				stopLoading();
				restoreCursor();
			}
		}

		node.addEventListener('click', handleClick);

		return {
			destroy() {
				node.removeEventListener('click', handleClick);
			},
			update(newHandler: AsyncClickHandler) {
				currentHandler = newHandler;
			}
		};
	}
</script>
