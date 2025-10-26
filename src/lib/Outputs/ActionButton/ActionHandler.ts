import type { OutputController } from '../../Infrastructure/OutputController';

export interface ActionButtonParameters {
	Action: string;
	[key: string]: any
}

export interface KeyActionButtonData {
	Parameters: ActionButtonParameters;
}

export interface ActionButtonData extends KeyActionButtonData {
	Label: string | null;
	Tooltip: string | null;
	CssClass: string | null;
	Icon: string | null;
}

export abstract class ActionHandler {
	/**
	 * The unique identifier for this action type (e.g., 'redirect-to-url', 'print').
	 * Must match the action name registered in the handlers registry.
	 */
	public abstract readonly action: string;

	/**
	 * Determines how the action button should be rendered in the DOM.
	 * - 'button': Renders as a <button> element, suitable for actions that modify state or trigger behavior
	 * - 'link': Renders as an <a> element, suitable for navigation actions
	 *
	 * Defaults to 'button' if not specified.
	 */
	public readonly renderAs?: 'button' | 'link' = 'button';

	protected controller: OutputController<KeyActionButtonData>;

	constructor(controller: OutputController<KeyActionButtonData>) {
		this.controller = controller;
	}

	/**
	 * Returns the URL for link-type handlers.
	 * Only needed when renderAs is 'link'. The returned URL will be set as the href attribute
	 * of the <a> element, enabling proper browser behavior (right-click, hover preview, etc.).
	 *
	 * @param data - The action button data containing parameters
	 * @returns The URL string, or null if no valid URL can be generated
	 */
	getHref?(data: KeyActionButtonData): Promise<string | null> | string | null;

	/**
	 * Executes the action when the action button is clicked.
	 * Only needed for button-type handlers. Link-type handlers can omit this as the browser
	 * handles navigation automatically via the href attribute.
	 *
	 * @param data - The action button data containing parameters
	 */
	execute?(data: KeyActionButtonData): Promise<void>;
}