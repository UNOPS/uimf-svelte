import type { IClientFunction } from "../IClientFunction";

export class TrackEvent implements IClientFunction {
    name: string = "track-event";

    handle(params?: any): void {
        const trackingId = (window as any).app?.googleTagId;

        if (!trackingId) {
            console.error("[TrackEvent] Google Tag ID not configured in app.googleTagId");
            return;
        }
        
        const eventName = params?.functionToRun?.CustomProperties?.EventName;
        const eventParameters = params?.functionToRun?.CustomProperties?.EventParameters || {};

        if (!eventName) {
            console.warn("[TrackEvent] No event name provided");
            return;
        }

        const gtag = (window as any).gtag;

        if (typeof gtag === 'function') {
            try {
                gtag('event', eventName, eventParameters);
            } catch (error) {
                console.error(`[TrackEvent] Failed to track event: ${eventName}`, error);
            }
        } else {
            console.info(`[TrackEvent] gtag not available, skipping: ${eventName}`);
        }
    }
}
