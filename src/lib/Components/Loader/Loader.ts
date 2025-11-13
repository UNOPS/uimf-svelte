import LoaderComponent from "./Loader.svelte";

export class Loader {
    #loaderComponent: LoaderComponent | null = null;
    #loaderHost: HTMLElement | null = null;
    #pending = 0;
    #currentProgress = 0;
    #progressTimer: number | null = null;
    #completionTimer: number | null = null;

    start(): void {
        if (!this.#canUseDom()) {
            return;
        }

        this.#clearCompletionTimer();

        if (this.#pending === 0) {
            if (this.#loaderComponent == null) {
                this.#mountLoader();
            } else {
                this.#currentProgress = 0;
                this.#loaderComponent.$set({ visible: true, progress: this.#currentProgress });
            }
        }

        this.#ensureProgressTimer();

        if (this.#loaderComponent != null) {
            this.#loaderComponent.$set({ visible: true });
        }

        this.#pending++;
    }

    stop(): void {
        if (!this.#canUseDom()) {
            return;
        }

        this.#pending = Math.max(0, this.#pending - 1);
        if (this.#pending === 0) {
            this.#completeLoader();
        }
    }

    #canUseDom(): boolean {
        return typeof window !== 'undefined' && typeof document !== 'undefined';
    }

    #stopProgressTimer(): void {
        if (this.#progressTimer != null) {
            clearInterval(this.#progressTimer);
            this.#progressTimer = null;
        }
    }

    #clearCompletionTimer(): void {
        if (this.#completionTimer != null) {
            clearTimeout(this.#completionTimer);
            this.#completionTimer = null;
        }
    }

    #mountLoader(): void {
        if (!this.#canUseDom() || this.#loaderComponent != null) {
            return;
        }

        this.#loaderHost = document.createElement('div');
        document.body.appendChild(this.#loaderHost);

        this.#currentProgress = 0;
        this.#loaderComponent = new LoaderComponent({
            target: this.#loaderHost,
            props: { visible: true, progress: this.#currentProgress }
        });
    }

    #unmountLoader(): void {
        this.#stopProgressTimer();
        this.#clearCompletionTimer();

        if (this.#loaderComponent == null) {
            return;
        }

        this.#loaderComponent.$destroy();
        this.#loaderComponent = null;
        this.#currentProgress = 0;

        if (this.#loaderHost) {
            this.#loaderHost.remove();
            this.#loaderHost = null;
        }
    }

    #ensureProgressTimer(): void {
        if (!this.#canUseDom() || this.#progressTimer != null) {
            return;
        }

        this.#progressTimer = window.setInterval(() => {
            if (!this.#loaderComponent) {
                return;
            }

            const remaining = 90 - this.#currentProgress;
            const increment = Math.max(1, remaining * 0.1);
            this.#currentProgress = Math.min(90, this.#currentProgress + increment);
            this.#loaderComponent.$set({ progress: this.#currentProgress, visible: true });
        }, 200);
    }

    #completeLoader(): void {
        if (!this.#loaderComponent) {
            return;
        }

        this.#stopProgressTimer();
        this.#currentProgress = 100;
        this.#loaderComponent.$set({ progress: this.#currentProgress, visible: true });

        this.#clearCompletionTimer();
        this.#completionTimer = window.setTimeout(() => {
            this.#unmountLoader();
        }, 200);
    }
}
