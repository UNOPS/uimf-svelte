import { ActionHandler, type ActionButtonData } from '../ActionHandler';

interface SetFieldValuesArgs {
	FieldMappings: Record<string, string>;
	AlternativeLabel: string | null;
	AlternativeIcon: string | null;
}

export class SetFieldValuesHandler extends ActionHandler {
	public action: string = 'set-field-values';

	private before: Record<string, any> = {};
	private copied: boolean = false;
	private originalLabel: string | null = null;
	private originalIcon: string | null = null;

	#getPropertyValueByPath(obj: any, path: string): any {
		if (!obj || !path) return null;

		const parts = path.split('/').filter(part => part.length > 0);
		let current = obj;

		for (const part of parts) {
			if (current == null) {
				return null;
			}

			current = current[part];
		}

		return current;
	}

	async #getFieldOrNonFieldValue(path: string): Promise<any> {
		const source = this.controller.getRelatedFieldByPath(path, false);

		if (source == null) {
			if (path.startsWith('/response/')) {
				const responsePath = path.substring('/response/'.length);

				const parts = responsePath.split('/');

				if (parts.length > 0) {
					const nonFieldName = parts[0];
					const nonFieldValue = this.controller.form?.response?.[nonFieldName].value;
					const nonFieldSubpath = responsePath.substring(nonFieldName.length);

					return this.#getPropertyValueByPath(nonFieldValue, nonFieldSubpath);
				}
			}

			throw new Error(`Cannot find field/non-field "${path}".`);
		}

		return await source.getValue();
	}

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

				const value = await this.#getFieldOrNonFieldValue(sourcePath);
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