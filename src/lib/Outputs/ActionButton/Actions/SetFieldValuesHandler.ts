import { ActionButtonParameters, ActionHandler, type ActionButtonData } from '../ActionHandler';

interface SetFieldValuesArgs extends ActionButtonParameters {
	FieldMappings: Record<string, string>;
	AlternativeLabel: string | null;
	AlternativeIcon: string | null;
}

export class SetFieldValuesHandler extends ActionHandler {
	public readonly renderAs = 'button' as const;
	public action: string = 'set-field-values';

	private before: Record<string, any> = {};
	private copied: boolean = false;
	private originalLabel: string | null = null;
	private originalIcon: string | null = null;

	async execute(data: ActionButtonData): Promise<void> {
		const copyParams = data.Parameters as SetFieldValuesArgs;
		if (!copyParams?.FieldMappings) {
			return;
		}

		// Store original label and icon on first execution
		if (this.originalLabel === null) {
			this.originalLabel = data.Label;
		}
		if (this.originalIcon === null) {
			this.originalIcon = data.Icon;
		}

		for (const [targetPath, sourcePath] of Object.entries(copyParams.FieldMappings)) {
			const target = this.controller.getRelatedFieldByPath(targetPath, true)!;

			if (!this.copied) {
				// Store original value before copying.
				this.before[targetPath] = await target.getValue();

				const value = await this.controller.getRelatedFieldValueByPath(sourcePath);
				await target.setValue(value);

			} else {
				// Restore original value.
				await target.setValue(this.before[targetPath]);
			}
		}

		this.copied = !this.copied;

		// Toggle label and icon if alternatives are provided
		if (this.controller.value) {
			if (copyParams.AlternativeLabel) {
				(this.controller.value as any).Label = this.copied
					? copyParams.AlternativeLabel
					: this.originalLabel;
			}
			if (copyParams.AlternativeIcon) {
				(this.controller.value as any).Icon = this.copied
					? copyParams.AlternativeIcon
					: this.originalIcon;
			}
		}
	}
}