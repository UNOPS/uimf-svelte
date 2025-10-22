import type { ILayoutField } from './ILayoutField';
import type { ILayoutContainer } from './ILayoutContainer';

export interface ILayout {
	CssClass: string;
	Fields: ILayoutField[];

	/**
	 * Root-level containers.
	 */
	Containers?: ILayoutContainer[] | null;
}
