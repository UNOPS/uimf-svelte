import type { OutputController } from '../../Infrastructure/OutputController';

export interface ClickableContentData {
	Content: any;
	Parameters: { Action: string; [key: string]: any };
}

export abstract class ActionHandler {
	public abstract readonly action: string;

	protected controller: OutputController<ClickableContentData>;

	constructor(controller: OutputController<ClickableContentData>) {
		this.controller = controller;
	}

	abstract execute(data: ClickableContentData): Promise<void>;
}
