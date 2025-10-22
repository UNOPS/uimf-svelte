import type { ILayoutItem } from './ILayoutItem';

/**
 * Represents a container that can hold multiple layout items (areas or nested containers).
 * Matches backend LayoutContainer class.
 */
export interface ILayoutContainer extends ILayoutItem {
	Type: 'container';
	CssClass: string | null;
	Children: ILayoutItem[];
}
