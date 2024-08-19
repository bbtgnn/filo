import { Schema as S } from '@effect/schema';
import { RecordId, uuidv7 } from 'surrealdb.js';
import * as kiwi from '@lume/kiwi';
import { Tuple } from 'effect';
import { getPerpendicularDimension, type Dimension } from '$lib/constraints';
import Maybe, { just, nothing } from 'true-myth/maybe';
import { config } from '$lib/config.js';

/* */

export class Block {
	text: string;
	id: RecordId;
	variables: {
		x: kiwi.Variable;
		y: kiwi.Variable;
	};

	static get dbName() {
		return 'block' as const;
	}

	constructor(id: string, text: string) {
		this.text = text;
		this.id = new RecordId(Block.dbName, id);
		this.variables = {
			x: new kiwi.Variable(),
			y: new kiwi.Variable()
		};
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
				new Block(
					this.id.id.toString() + '0', // TODO - refine, mabye some method
					chunks[0]
				),
				new Block(this.id.id.toString() + '1', chunks[1])
			)
		);
	}

	get position(): Position {
		return { x: this.variables.x.value(), y: this.variables.y.value() };
	}

	get coordinates(): Position {
		const offsetX = config.viewport.width / 2;
		const offsetY = config.viewport.height / 2;
		const spaceX = config.block.baseWidth + config.viewport.defaultGap;
		const spaceY = config.block.baseHeight + config.viewport.defaultGap;
		return {
			x: this.variables.x.value() * spaceX + offsetX,
			y: this.variables.y.value() * spaceY + offsetY
		};
	}
}

export type Position = Record<Dimension, number>;

export type BlockSplitResult = { in: Block; out: Block; queue: Block[]; link: Link };

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

	static get dbName() {
		return 'link' as const;
	}

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
