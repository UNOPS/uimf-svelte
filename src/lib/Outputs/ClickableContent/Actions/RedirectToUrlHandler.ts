import { ActionHandler, type ClickableContentData } from '../ActionHandler';

interface RedirectToUrlArgs {
	Url: string;
}

export class RedirectToUrlHandler extends ActionHandler {
	public action: string = 'redirect-to-url';

	async execute(data: ClickableContentData): Promise<void> {
		const params = data.Parameters as RedirectToUrlArgs;
		if (!params?.Url) {
			console.warn('RedirectToUrlHandler: URL is missing');
			return;
		}

		window.location.href = params.Url;
	}
}