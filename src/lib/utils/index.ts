import { type Dimension, type Size } from '$lib/data-model/types';

export function getPerpendicularDimension(dimension: string | Dimension): Dimension {
	return dimension == 'x' ? 'y' : 'x';
}

export function dimensionToSize(dimension: Dimension): Size {
	if (dimension == 'x') return 'width';
	else return 'height';
}
