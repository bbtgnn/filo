// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export type Dimension = 'x' | 'y';
export type Point = Record<Dimension, number>;

export type Size = 'width' | 'height';
export type Rectangle = Record<Size, number>;

export type Sign = 1 | -1;

export type Direction = {
	dimension: Dimension;
	sign: Sign;
};
