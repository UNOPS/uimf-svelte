<script context="module" lang="ts">
	export type AsyncClickHandler = (event: MouseEvent) => Promise<void>;

	function startLoadingAnimation(node: HTMLButtonElement, originalBgColor: string): () => void {
		// Save original inline styles so we can restore them later
		const originalBgImage = node.style.backgroundImage;
		const originalBgSize = node.style.backgroundSize;
		const originalBgPosition = node.style.backgroundPosition;
		const originalBgRepeat = node.style.backgroundRepeat;
		const originalBgColorInline = node.style.backgroundColor;

		// Get computed background to layer on top of
		const computed = getComputedStyle(node);
		const computedBgImage = computed.backgroundImage;

		// Preserve the original background color as inline style (overrides disabled CSS)
		node.style.backgroundColor = originalBgColor;

		// Derive progress bar color from button's original background color (before disabled state)
		const progressBarColor = deriveProgressBarColor(originalBgColor);
		const progressBar = `linear-gradient(to right, ${progressBarColor}, ${progressBarColor})`;

		// Layer progress bar on top of existing background
		const hasExistingBg = computedBgImage && computedBgImage !== 'none';
		node.style.backgroundImage = hasExistingBg ? `${progressBar}, ${computedBgImage}` : progressBar;
		node.style.backgroundPosition = hasExistingBg ? 'left center, center' : 'left center';
		node.style.backgroundRepeat = hasExistingBg ? 'no-repeat, repeat' : 'no-repeat';

		const startTime = performance.now();
		let animationId: number;
		let stopped = false;

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

			// Animate to 100%
			updateProgress(1);

			// Restore original styles after transition
			setTimeout(() => {
				node.style.backgroundImage = originalBgImage;
				node.style.backgroundSize = originalBgSize;
				node.style.backgroundPosition = originalBgPosition;
				node.style.backgroundRepeat = originalBgRepeat;
				node.style.backgroundColor = originalBgColorInline;
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
			'red': 'rgb(255, 0, 0)',
			'blue': 'rgb(0, 0, 255)',
			'green': 'rgb(0, 128, 0)',
			'yellow': 'rgb(255, 255, 0)',
			'white': 'rgb(255, 255, 255)',
			'black': 'rgb(0, 0, 0)',
			'gray': 'rgb(128, 128, 128)',
		};
		if (namedColors[color.toLowerCase()]) {
			return namedColors[color.toLowerCase()];
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
			return 'rgba(128, 128, 128, 0.4)';
		}

		// 2. Parse RGB values from the normalized color string
		const rgbMatch = rgbColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
		
		if (!rgbMatch) {
			// Should not happen after toRgb conversion, but kept as a safeguard
			return 'rgba(128, 128, 128, 0.4)';
		}

		const r = parseInt(rgbMatch[1], 10);
		const g = parseInt(rgbMatch[2], 10);
		const b = parseInt(rgbMatch[3], 10);

		// 3. Calculate perceived brightness using luminance formula
		// Luminance formula: L = 0.299*R + 0.587*G + 0.114*B 
		const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

		let newR: number, newG: number, newB: number;

		// 4. Adaptive Brightness Logic (same as original)
		if (brightness > 200) {
			// Light background: darken to ~40% brightness
			const factor = 0.4;
			newR = Math.round(r * factor);
			newG = Math.round(g * factor);
			newB = Math.round(b * factor);
		} else if (brightness < 55) {
			// Dark background: lighten to ~60% brightness
			const factor = 0.6;
			// Interpolate towards white
			newR = Math.round(255 - (255 - r) * factor);
			newG = Math.round(255 - (255 - g) * factor);
			newB = Math.round(255 - (255 - b) * factor);
		} else {
			// Colored background: darken by ~30%
			const factor = 0.7;
			newR = Math.round(r * factor);
			newG = Math.round(g * factor);
			newB = Math.round(b * factor);
		}

		// 5. Return the new color with 40% opacity
		return `rgba(${newR}, ${newG}, ${newB}, 0.4)`;
	}

	export function onAsyncClick(node: HTMLButtonElement, handler: AsyncClickHandler) {
		let currentHandler = handler;
		let isLoading = false;

		async function handleClick(event: MouseEvent) {
			if (node.disabled || isLoading) return;

			const originalBgColor = getComputedStyle(node).backgroundColor;

			isLoading = true;
			const stopLoading = startLoadingAnimation(node, originalBgColor);

			try {
				await currentHandler(event);
			} finally {
				stopLoading();
				isLoading = false;
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
