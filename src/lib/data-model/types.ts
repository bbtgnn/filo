export type Dimension = 'x' | 'y';
export type Point = Record<Dimension, number>;

export type Size = 'width' | 'height';
export type Rectangle = Record<Size, number>;

export type Sign = 1 | -1;

export type Direction = {
	dimension: Dimension;
	sign: Sign;
};
