<script context="module" lang="ts">
	import { colord } from 'colord';

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

	const PROGRESS_BAR_OPACITY = 0.4;

	/**
	 * Derives an appropriate progress bar color from the button's background color.
	 * Uses adaptive brightness handling to ensure visibility on any background.
	 */
	function deriveProgressBarColor(bgColor: string): string {
		const color = colord(bgColor);

		if (!color.isValid()) {
			return `rgba(128, 128, 128, ${PROGRESS_BAR_OPACITY})`;
		}

		const brightness = color.brightness();

		let adjusted;
		if (brightness > 0.78) {
			// Light background: darken significantly
			adjusted = color.darken(0.3);
		} else if (brightness < 0.22) {
			// Dark background: lighten
			adjusted = color.lighten(0.3);
		} else {
			// Mid-tone background: darken subtly
			adjusted = color.darken(0.15);
		}

		return adjusted.alpha(PROGRESS_BAR_OPACITY).toRgbString();
	}

	function setProgressCursor(node: HTMLButtonElement): () => void {
		const originalCursor = node.style.cursor;
		node.style.cursor = 'progress';

		return () => {
			node.style.cursor = originalCursor;
		};
	}

	export async function withButtonLoading<T>(
		button: HTMLButtonElement,
		asyncFn: () => Promise<T>
	): Promise<T> {
		const originalBgColor = getComputedStyle(button).backgroundColor;

		button.disabled = true;

		const restoreCursor = setProgressCursor(button);
		const stopLoading = startLoadingAnimation(button, originalBgColor);

		try {
			return await asyncFn();
		} finally {
			button.disabled = false;

			stopLoading();
			restoreCursor();
		}
	}

	export function onAsyncClick(node: HTMLButtonElement, handler: AsyncClickHandler) {
		let currentHandler = handler;

		async function handleClick(event: MouseEvent) {
			if (node.disabled) return;

			await withButtonLoading(node, () => currentHandler(event));
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
