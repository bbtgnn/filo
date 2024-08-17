import { Schema as S } from '@effect/schema';
import { RecordId as _RecordId, uuidv7 } from 'surrealdb.js';
import * as kiwi from '@lume/kiwi';
import { pipe, Option as O, Array as A, String } from 'effect';

/* */

export const RecordId = S.String.pipe(
	S.transform(S.instanceOf(_RecordId), {
		encode: recordIdToStringId,
		decode: stringIdToRecordId
	})
);

function recordIdToStringId(recordId: _RecordId) {
	return `${recordId.tb}:${recordId.id}`;
}

function stringIdToRecordId(stringId: string): _RecordId {
	const parts = stringId.split(':');
	return new _RecordId(parts[0], parts[1]);
}

/* */

export const Variable = S.Number.pipe(
	S.transform(S.instanceOf(kiwi.Variable), {
		encode: (variable) => variable.value(),
		decode: () => {
			// TODO - Pass solver from context!
			const variable = new kiwi.Variable();
			// Solver.instance.addEditVariable(variable, kiwi.Strength.weak);
			// Solver.instance.suggestValue(variable, number);
			return variable;
		}
	})
);

/* */

export class Block extends S.Class<Block>('block')({
	text: S.String,
	id: RecordId,
	coordinates: S.Struct({
		x: Variable,
		y: Variable
	})
}) {
	static new(data: Omit<BlockData, 'coordinates'>): Block {
		// TODO - store in db
		return S.decodeSync(Block)({
			...data,
			id: `${Block.identifier}:${data.id}`,
			coordinates: { x: 0, y: 0 }
		});
	}

	split(selection: Selection): Block[] {
		return pipe(
			selection.anchorNode?.textContent,
			O.fromNullable,
			O.map((textContent) =>
				pipe(
					[selection.anchorOffset, selection.focusOffset].sort(),
					([start, end]) => [
						textContent.slice(0, start),
						textContent.slice(start, end),
						textContent.slice(end)
					],
					A.map(String.trim),
					A.filter(String.isNonEmpty),
					A.map((text, index) =>
						Block.new({
							text,
							id: this.id.id.toString() + index // TODO - refine
						})
					)
				)
			),
			O.getOrThrow
		);
	}
}

export type BlockData = typeof Block.Encoded;

/* */

export class Dimension extends S.Class<Dimension>('dimension')({
	id: RecordId
}) {}

/* */

export class Link extends S.Class<Link>('link')({
	id: RecordId,
	in: RecordId,
	out: RecordId,
	dimension: RecordId,
	sign: S.Literal(-1, 1)
}) {
	static new(data: Omit<LinkData, 'id'>): Link {
		// TODO - store in db
		return S.decodeSync(Link)({
			...data,
			id: `${Link.identifier}:${uuidv7()}`,
			in: `${Block.identifier}:${data.in}`,
			out: `${Block.identifier}:${data.out}`,
			dimension: `${Dimension.identifier}:${data.dimension}`
		});
	}
}

export type LinkData = typeof Link.Encoded;
