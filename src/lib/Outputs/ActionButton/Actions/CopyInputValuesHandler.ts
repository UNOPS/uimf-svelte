import { ActionHandler, type ActionButtonData } from '../ActionHandler';

interface CopyInputValuesArgs {
	FieldMappings: Record<string, string>;
	AlternativeLabel: string | null;
	AlternativeIcon: string | null;
}

export class CopyInputValuesHandler extends ActionHandler {
	public action: string = 'copy-input-values';

	private before: Record<string, any> = {};
	private copied: boolean = false;
	private originalLabel: string | null = null;
	private originalIcon: string | null = null;

	async execute(data: ActionButtonData): Promise<void> {
		const copyParams = data.Parameters as CopyInputValuesArgs;
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

		for (const [sourcePath, targetPath] of Object.entries(copyParams.FieldMappings)) {
			const target = this.controller.getRelatedFieldByPath(targetPath, true)!;

			if (!this.copied) {
				// Store original value before copying.
				this.before[targetPath] = await target.getValue();

				const source = this.controller.getRelatedFieldByPath(sourcePath, true)!;

				const value = await source.getValue();
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
				this.controller.value.Label = this.copied
					? copyParams.AlternativeLabel
					: this.originalLabel;
			}
			if (copyParams.AlternativeIcon) {
				this.controller.value.Icon = this.copied
					? copyParams.AlternativeIcon
					: this.originalIcon;
			}
		}
	}
}