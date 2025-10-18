import type { OutputController } from '../../Infrastructure/OutputController';
import { ClickableContentController, ClickableContentData } from './ClickableContent.svelte';

/**
 * Base class for handlers that define the behavior when a ClickableContent component is interacted with.
 *
 * Handlers can render as either buttons (for actions) or links (for navigation):
 * - Button handlers: Set renderAs to 'button' and implement execute() to perform the action
 * - Link handlers: Set renderAs to 'link' and implement getHref() to provide the URL
 */
export abstract class ActionHandler {
	/**
	 * The unique identifier for this action type (e.g., 'redirect-to-url', 'print').
	 * Must match the action name registered in the handlers registry.
	 */
	public abstract readonly action: string;

	/**
	 * Determines how the clickable content should be rendered in the DOM.
	 * - 'button': Renders as a <button> element, suitable for actions that modify state or trigger behavior
	 * - 'link': Renders as an <a> element, suitable for navigation actions
	 *
	 * Defaults to 'button' if not specified.
	 */
	public readonly renderAs?: 'button' | 'link' = 'button';

	/**
	 * The controller for the ClickableContent component that owns this handler.
	 */
	protected controller: ClickableContentController;

	constructor(controller: OutputController<ClickableContentData>) {
		this.controller = controller;
	}

	/**
	 * Returns the URL for link-type handlers.
	 * Only needed when renderAs is 'link'. The returned URL will be set as the href attribute
	 * of the <a> element, enabling proper browser behavior (right-click, hover preview, etc.).
	 *
	 * @param data - The clickable content data containing parameters
	 * @returns The URL string, or null if no valid URL can be generated
	 */
	getHref?(data: ClickableContentData): string | null;

	/**
	 * Executes the action when the clickable content is clicked.
	 * Only needed for button-type handlers. Link-type handlers can omit this as the browser
	 * handles navigation automatically via the href attribute.
	 *
	 * @param data - The clickable content data containing parameters
	 */
	execute?(data: ClickableContentData): Promise<void>;
}
