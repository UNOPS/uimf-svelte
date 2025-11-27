<script context="module" lang="ts">
	export type AsyncClickHandler = (event: MouseEvent) => Promise<void>;

	function startLoadingAnimation(node: HTMLButtonElement): () => void {
		// Save original inline styles so we can restore them later
		const originalBgImage = node.style.backgroundImage;
		const originalBgSize = node.style.backgroundSize;
		const originalBgPosition = node.style.backgroundPosition;
		const originalBgRepeat = node.style.backgroundRepeat;

		// Get computed background to layer on top of
		const computed = getComputedStyle(node);
		const computedBgImage = computed.backgroundImage;

		// Progress bar: solid semi-transparent white via gradient
		const progressBar = 'linear-gradient(to right, rgba(255,255,255,0.4), rgba(255,255,255,0.4))';

		// Layer progress bar on top of existing background
		const hasExistingBg = computedBgImage && computedBgImage !== 'none';
		node.style.backgroundImage = hasExistingBg ? `${progressBar}, ${computedBgImage}` : progressBar;
		node.style.backgroundPosition = hasExistingBg ? 'left center, center' : 'left center';
		node.style.backgroundRepeat = hasExistingBg ? 'no-repeat, repeat' : 'no-repeat';

		const startTime = performance.now();
		const rate = 0.001; // Controls approach speed (smaller = slower)
		let animationId: number;
		let stopped = false;

		function updateProgress(progress: number) {
			const sizeValue = `${progress * 100}% 100%`;
			node.style.backgroundSize = hasExistingBg ? `${sizeValue}, auto` : sizeValue;
		}

		function animate() {
			if (stopped) return;

			const elapsed = performance.now() - startTime;
			// Asymptotic: approaches 1 but never reaches it
			// ~63% at 1s, ~86% at 2s, ~95% at 3s
			const progress = (1 - Math.exp(-elapsed * rate)) * 0.95; // Cap at 95%
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
			}, 150);
		};
	}

	export function onAsyncClick(node: HTMLButtonElement, handler: AsyncClickHandler) {
		let currentHandler = handler;

		async function handleClick(event: MouseEvent) {
			if (node.disabled) return;

			node.disabled = true;
			const stopLoading = startLoadingAnimation(node);

			try {
				await currentHandler(event);
			} finally {
				stopLoading();
				node.disabled = false;
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
