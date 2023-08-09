class HandlerEntry {
    constructor(handle: ((e: any) => Promise<void>) | ((e: any) => void), unsubscribe: () => void) {
        this.handle = handle;
        this.unsubscribe = unsubscribe;
    }

    public handle: ((e: any) => Promise<void>) | ((e: any) => void);
    public unsubscribe: () => void;
}

export default class EventSource implements IEventSource {
    private eventHandlerCounter = 0;
    private eventHandlers: { [id: string]: HandlerEntry } = {};

    public onWindowEvent(eventName: string, fn: ((e: any) => Promise<void>) | ((e: any) => void)) {

        window.addEventListener(eventName, fn);

        this.eventHandlerCounter++;
        const key = 'window:' + eventName + '#' + this.eventHandlerCounter;

        var unsubscribe = () => {
            delete this.eventHandlers[key];
            window.removeEventListener(eventName, fn);
        };

        this.eventHandlers[key] = new HandlerEntry(fn, unsubscribe);

        return unsubscribe;
    }

    public async fire(eventName: string, params: any): Promise<void> {
        let promises = Object.keys(this.eventHandlers)
            .filter(t => t.startsWith(eventName + '#'))
            .map(t => this.eventHandlers[t].handle(params))
            .filter(t => t != null);

        await Promise.all(promises);
    }

    public on(eventName: string, fn: ((e: any) => Promise<void>) | ((e: any) => void)): () => void {
        this.eventHandlerCounter++;
        const key = eventName + '#' + this.eventHandlerCounter;

        var unsubscribe = () => delete this.eventHandlers[key];

        this.eventHandlers[key] = new HandlerEntry(fn, unsubscribe);

        return unsubscribe;
    }

    /**
     * Removes all event subscriptions.
     */
    public removeSubscriptions() {
        Object.keys(this.eventHandlers).forEach(key => {
            this.eventHandlers[key].unsubscribe();
        });

        this.eventHandlerCounter = 0;
    }
}

/**
 * Represents an object that has an event stream. 
 */
export interface IEventSource {
    /**
     * Triggers an event on this object.
     * @param eventName Name of the event to trigger.
     * @param params Event's parameters if any.
     */
    fire(eventName: string, params?: any): void;

    /**
     * Subscribes to this object's event. 
     * @param eventName Name of the event to subscribe to.
     * @param fn Callback function to invoke when event occurs. When invoked, the callback will be supplied with the event args.
     * @returns Unsubscribe function.
     */
    on(eventName: string, fn: (e?: any) => void): () => void;
}