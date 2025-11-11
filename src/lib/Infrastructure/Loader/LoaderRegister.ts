import Loader from "../../Components/Loader/Loader.svelte";

declare global {
    interface Window {
        __uimfLoader?: {
            start: () => void;
            stop: () => void;
        };
    }
}

export function registerLoader(): void {
    if (typeof window === 'undefined' || !window.fetch || window.__uimfLoader) {
        return;
    }

    const originalFetch = window.fetch.bind(window);
    let loaderComponent: Loader | null = null;
    let loaderHost: HTMLElement | null = null;
    let pending = 0;
    let currentProgress = 0;
    let progressTimer: number | null = null;
    let completionTimer: number | null = null;

    function stopProgressTimer(): void {
        if (progressTimer != null) {
            window.clearInterval(progressTimer);
            progressTimer = null;
        }
    }

    function clearCompletionTimer(): void {
        if (completionTimer != null) {
            window.clearTimeout(completionTimer);
            completionTimer = null;
        }
    }

    function mountLoader(): void {
        if (loaderComponent != null) {
            return;
        }

        loaderHost = document.createElement('div');
        document.body.appendChild(loaderHost);

        currentProgress = 0;
        loaderComponent = new Loader({
            target: loaderHost,
            props: { visible: true, progress: currentProgress }
        });
    }

    function unmountLoader(): void {
        stopProgressTimer();
        clearCompletionTimer();
        if (loaderComponent == null) {
            return;
        }

        loaderComponent.$destroy();
        loaderComponent = null;
        currentProgress = 0;

        if (loaderHost) {
            loaderHost.remove();
            loaderHost = null;
        }
    }

    function ensureProgressTimer(): void {
        if (progressTimer != null) {
            return;
        }

        progressTimer = window.setInterval(() => {
            if (!loaderComponent) {
                return;
            }

            const remaining = 90 - currentProgress;
            const increment = Math.max(1, remaining * 0.1);
            currentProgress = Math.min(90, currentProgress + increment);
            loaderComponent.$set({ progress: currentProgress, visible: true });
        }, 200);
    }

    function completeLoader(): void {
        if (!loaderComponent) {
            return;
        }

        stopProgressTimer();
        currentProgress = 100;
        loaderComponent.$set({ progress: currentProgress, visible: true });

        clearCompletionTimer();
        completionTimer = window.setTimeout(() => {
            unmountLoader();
        }, 200);
    }

    function showLoader(): void {
        clearCompletionTimer();

        if (pending === 0) {
            if (loaderComponent == null) {
                mountLoader();
            } else {
                currentProgress = 0;
                loaderComponent.$set({ visible: true, progress: currentProgress });
            }
        }

        ensureProgressTimer();

        if (loaderComponent != null) {
            loaderComponent.$set({ visible: true });
        }

        pending++;
    }

    function hideLoader(): void {
        pending = Math.max(0, pending - 1);
        if (pending === 0) {
            completeLoader();
        }
    }

    window.__uimfLoader = {
        start: showLoader,
        stop: hideLoader
    };

    window.fetch = (input: RequestInfo | URL, init?: (RequestInit & { skipLoader?: boolean })) => {
        const skipLoader = init?.skipLoader === true;

        if (!skipLoader && typeof document !== 'undefined') {
            showLoader();
        }

        return originalFetch(input, init)
            .then((response) => {
                if (!skipLoader) {
                    hideLoader();
                }
                return response;
            })
            .catch((error) => {
                if (!skipLoader) {
                    hideLoader();
                }
                throw error;
            });
    };
}

