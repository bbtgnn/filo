import { Schema as S } from '@effect/schema';

export class Block extends S.Class<Block>('block')({
	text: S.String
}) {}

export class Link extends S.Class<Link>('link')({
	in: S.String,
	out: S.String,
	i: S.Int,
	j: S.Int
}) {}
