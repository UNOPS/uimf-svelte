import { ActionHandler } from '../ActionHandler';
import { ClickableContentData } from '../ClickableContent.svelte';

interface RedirectToUrlArgs {
	Action: string;
	Url: string;
}

export class RedirectToUrlHandler extends ActionHandler {
	public readonly renderAs = 'link' as const;
	public readonly action = 'redirect-to-url';

	getHref(data: ClickableContentData): string | null {
		const params = data.Parameters as RedirectToUrlArgs;
		return params?.Url ?? null;
	}
}