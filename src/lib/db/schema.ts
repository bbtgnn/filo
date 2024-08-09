// import { Schema as S } from '@effect/schema';

import type { RecordId } from 'surrealdb.js';
import type { Entry } from './types';

export type BlockIn = {
	text: string;
};

export type DimensionIn = {
	vector: string;
};

export type LinkIn = {
	in: string;
	out: string;
	dimension: string;
	sign: -1 | 1;
};

export type Block = Entry<BlockIn>;
export type Dimension = Entry<DimensionIn>;
export type Link = Entry<{
	sign: LinkIn['sign'];
	in: RecordId;
	out: RecordId;
	dimension: RecordId;
}>;

// /* Record Id */

// export const BaseRecordId = S.Struct({
// 	tb: S.String,
// 	id: S.String
// });

// export const RecordId = S.String.pipe(
// 	S.transform(BaseRecordId, { decode: stringIdToRecordId, encode: recordIdToStringId })
// );

// function recordIdToStringId(recordId: typeof BaseRecordId.Type) {
// 	return `${recordId.tb}:${recordId.id}`;
// }

// function stringIdToRecordId(stringId: string): typeof BaseRecordId.Type {
// 	const parts = stringId.split(':');
// 	return {
// 		tb: parts[0],
// 		id: parts[1]
// 	};
// }

// /* Classes */

// export class Block extends S.Class<Block>('block')({
// 	text: S.String
// }) {}

// export class Dimension extends S.Class<Dimension>('dimension')({
// 	vector: S.String
// }) {}

// export class Link extends S.Class<Link>('link')({
// 	in: RecordId,
// 	out: RecordId,
// 	sign: S.Literal(1, -1),
// 	dimension: RecordId
// }) {}

// /* Dao */

// export const Dao = {
// 	Block,
// 	Dimension,
// 	Link
// } as const;

// export type Dao = typeof Dao;
