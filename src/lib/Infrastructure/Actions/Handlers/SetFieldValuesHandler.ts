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
			this.originalLabel = (data as any).Content?.Label?.Value ?? null;
		}

		if (this.originalIcon === null) {
			this.originalIcon = (data as any).Content?.Icon?.Name ?? null;
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
		const content = (this.controller.value as any)?.Content;
		if (content != null) {
			if (copyParams.AlternativeLabel && content.Label != null) {
				content.Label.Value = this.copied
					? copyParams.AlternativeLabel
					: this.originalLabel;
			}

			if (copyParams.AlternativeIcon && content.Icon != null) {
				content.Icon.Name = this.copied
					? copyParams.AlternativeIcon
					: this.originalIcon;
			}
		}
	}
}