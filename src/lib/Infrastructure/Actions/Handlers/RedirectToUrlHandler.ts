import { type ActionButtonParameters, ActionHandler, type KeyActionButtonData } from '../ActionHandler';

interface RedirectToUrlArgs extends ActionButtonParameters {
	Url: string;
}

export class RedirectToUrlHandler extends ActionHandler {
	public readonly renderAs = 'link' as const;
	public readonly action = 'redirect-to-url';

	getHref(data: KeyActionButtonData): string | null {
		const params = data.Parameters as RedirectToUrlArgs;
		return params?.Url ?? null;
	}
}