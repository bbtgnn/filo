import { type Dimension } from '$lib/data-model/types';

export function getPerpendicularDimension(dimension: string | Dimension): Dimension {
	return dimension == 'x' ? 'y' : 'x';
}
