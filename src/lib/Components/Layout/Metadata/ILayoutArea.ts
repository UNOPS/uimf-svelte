import type { ILayoutItem } from './ILayoutItem';

/**
 * Represents a single area inside a layout.
 * Matches backend LayoutArea class.
 */
export interface ILayoutArea extends ILayoutItem {
	Type: 'area';
	Name: string;
	AreaCssClass: string | null;
	FieldCssClass: string | null;
	OrderIndex: number;
}
