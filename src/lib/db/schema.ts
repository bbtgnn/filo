import { Schema as S } from '@effect/schema';
import { RecordId as _RecordId, uuidv7 } from 'surrealdb.js';
import * as kiwi from '@lume/kiwi';
import { Tuple } from 'effect';
import { getPerpendicularDimension, type Dimension } from '$lib/constraints';
import Maybe, { just, nothing } from 'true-myth/maybe';

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
	variables: S.Struct({
		x: Variable,
		y: Variable
	})
}) {
	static new(data: Omit<BlockData, 'variables'>): Block {
		// TODO - store in db
		return S.decodeSync(Block)({
			...data,
			id: `${Block.identifier}:${data.id}`,
			variables: { x: 0, y: 0 }
		});
	}

	split(selection: Selection): Maybe<BlockSplitResult> {
		if (selection.isCollapsed) {
			const cursorIndex = selection.anchorOffset;
			return this.splitAtIndex(cursorIndex).map(([firstBlock, secondBlock]) => ({
				in: firstBlock,
				out: secondBlock,
				link: new Link(firstBlock, secondBlock, 'y', 1), // TODO - Get from preferences
				queue: []
			}));
		} else {
			const [selectionStart, selectionEnd] = [selection.anchorOffset, selection.focusOffset].sort();
			if (selectionStart === 0) {
				return this.splitAtIndex(selectionEnd).map(([firstBlock, secondBlock]) => ({
					in: secondBlock,
					out: firstBlock,
					link: new Link(secondBlock, firstBlock, 'y', 1), // TODO - Get from preferences
					queue: []
				}));
			} else {
				return this.splitAtIndex(selectionStart).map(([firstBlock, secondAndThirdBlock]) => {
					const [secondBlock, thirdBlock] = secondAndThirdBlock
						.splitAtIndex(selectionEnd)
						.unwrapOrElse(() => {
							throw new Error('Badly formatted third block');
						});
					return {
						in: firstBlock,
						out: secondBlock,
						link: new Link(firstBlock, secondBlock, 'y', 1), // TODO - Get from preferences
						queue: [thirdBlock]
					};
				});
			}
		}
	}

	splitAtIndex(index: number): Maybe<[Block, Block]> {
		if (index <= 0) return nothing();
		const chunks = [this.text.slice(0, index), this.text.slice(index)] as const;
		return just(
			Tuple.make(
				Block.new({
					text: chunks[0],
					id: this.id.id.toString() + '0' // TODO - refine, mabye some method
				}),
				Block.new({
					text: chunks[1],
					id: this.id.id.toString() + '1'
				})
			)
		);
	}

	get position(): Position {
		return { x: this.variables.x.value(), y: this.variables.y.value() };
	}
}

export type Position = Record<Dimension, number>;

export type BlockSplitResult = { in: Block; out: Block; queue: Block[]; link: Link };

export type BlockData = typeof Block.Encoded;

/* */

// export class Dimension extends S.Class<Dimension>('dimension')({
// 	id: RecordId
// }) {}

export const Cnstraint = S.instanceOf(kiwi.Constraint);
export type Sign = -1 | 1;

/* */

// TODO - transform in and out into blocks
export class Link {
	id: string;
	in: Block;
	out: Block;
	dimension: Dimension;
	sign: Sign;
	constraints: {
		main: kiwi.Constraint;
		secondary: kiwi.Constraint;
	};

	constructor(blockIn: Block, blockOut: Block, dimension: Dimension, sign: Sign) {
		this.in = blockIn;
		this.out = blockOut;
		this.dimension = dimension;
		this.sign = sign;
		this.constraints = this.getConstraints();
		this.id = uuidv7();
	}

	getConstraints() {
		const perpendicularDimension = getPerpendicularDimension(this.dimension);
		return {
			main: new kiwi.Constraint(
				this.in.variables[this.dimension].plus(this.sign),
				this.sign == -1 ? kiwi.Operator.Ge : kiwi.Operator.Le,
				this.out.variables[this.dimension],
				kiwi.Strength.required
			),
			secondary: new kiwi.Constraint(
				this.in.variables[perpendicularDimension],
				kiwi.Operator.Eq,
				this.out.variables[perpendicularDimension],
				kiwi.Strength.weak
			)
		};
	}
}
