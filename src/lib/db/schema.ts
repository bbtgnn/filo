import { Schema as S } from '@effect/schema';

export class DbBlock extends S.Class<DbBlock>('block')({
	text: S.String,
	i: S.Number,
	j: S.Number,
	k: S.Number,
	id: S.String
}) {}

export class DbLink extends S.Class<DbLink>('link')({
	in: S.String,
	out: S.String,
	dimension: S.Literal('i', 'j', 'k'),
	sign: S.Literal(1, -1),
	id: S.String
}) {}

export function convertLinkToSpatialDirection(l: DbLink) {
	if (l.dimension == 'i') return { x: 1 * l.sign, y: 0, z: 0 };
	else if (l.dimension == 'j') return { x: 0, y: 1 * l.sign, z: 0 };
	else if (l.dimension == 'k') return { x: 0, y: 0, z: 1 * l.sign };
}
