import type { OutputController } from '../../Infrastructure/OutputController';

export interface ActionButtonData {
	Label: string | null;
	Parameters: { Action: string, [key: string]: any };
	Tooltip: string | null;
	CssClass: string | null;
	Icon: string | null;
}

export abstract class ActionHandler {
	public abstract readonly action: string;

	protected controller: OutputController<ActionButtonData>;

	constructor(controller: OutputController<ActionButtonData>) {
		this.controller = controller;
	}

	abstract execute(data: any): Promise<void>;
}