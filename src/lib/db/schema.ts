import { Schema as S } from '@effect/schema';

export class Block extends S.Class<Block>('block')({
	text: S.String
}) {}

export class Dimension extends S.Class<Dimension>('dimension')({
	vector: S.String
}) {}

export class Link extends S.Class<Link>('link')({
	in: S.String,
	out: S.String,
	dimension: S.String,
	sign: S.Literal(1, -1)
}) {}

export const Dao = {
	Block,
	Dimension,
	Link
} as const;

export type Dao = typeof Dao;
