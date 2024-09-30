// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { type Dimension, type Size } from '@/types';

export function getPerpendicularDimension(dimension: string | Dimension): Dimension {
	return dimension == 'x' ? 'y' : 'x';
}

export function dimensionToSize(dimension: Dimension): Size {
	if (dimension == 'x') return 'width';
	else return 'height';
}
