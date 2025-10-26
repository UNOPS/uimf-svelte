import { ActionHandler } from '../ActionHandler';
import type { ActionButtonData, ActionButtonParameters } from '../ActionHandler';

interface RedirectToFormArgs extends ActionButtonParameters {
	Form: string;
	InputFieldValues: Record<string, any> | null;
};

export class RedirectToFormHandler extends ActionHandler {
	public readonly renderAs = 'link' as const;
	public readonly action = 'redirect-to-form';

	async getHref(data: ActionButtonData): Promise<string | null> {
		const params = data.Parameters as RedirectToFormArgs;

		if (!params?.Form) {
			return null;
		}

		return await this.controller.app.makeUrl({
			Form: params.Form,
			InputFieldValues: params.InputFieldValues ?? null
		});
	}
}
