import { Schema as S } from '@effect/schema';

export const RecordId = S.Struct({
	tb: S.String,
	id: S.String
});

export class Block extends S.Class<Block>('block')({
	text: S.String
}) {}

export class Dimension extends S.Class<Dimension>('dimension')({
	vector: S.String
}) {}

export class Link extends S.Class<Link>('link')({
	in: S.String,
	out: S.String,
	sign: S.Literal(1, -1),
	// dimension: S.String, // TODO - Define decode and encode for this
	dimension: S.String.pipe(
		S.transform(RecordId, { strict: true, decode: stringIdToRecordId, encode: recordIdToStringId })
	)
}) {}

export const Dao = {
	Block,
	Dimension,
	Link
} as const;

export type Dao = typeof Dao;

//

function recordIdToStringId(recordId: typeof RecordId.Type) {
	return `${recordId.tb}:${recordId.id}`;
}

function stringIdToRecordId(stringId: string): typeof RecordId.Type {
	const parts = stringId.split(':');
	return {
		tb: parts[0],
		id: parts[1]
	};
}
