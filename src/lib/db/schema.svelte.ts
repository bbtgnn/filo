import { Schema as S } from '@effect/schema';
import { RecordId, uuidv7 } from 'surrealdb.js';
import * as kiwi from '@lume/kiwi';
import { String, Tuple } from 'effect';
import { getPerpendicularDimension, type Dimension } from '$lib/constraints';
import Maybe, { just, nothing } from 'true-myth/maybe';
import { config } from '$lib/config.js';
import BlockContent from '$lib/components/blockContent.svelte';
import { mount } from 'svelte';

/* */

export class Block {
	text: string;
	id: RecordId;
	variables: {
		x: kiwi.Variable;
		y: kiwi.Variable;
	};
	element = $state<HTMLElement>();

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

	// TODO - cleanup
	split(selection: Selection): Maybe<BlockSplitResult> {
		if (selection.isCollapsed) {
			const cursorIndex = selection.anchorOffset;
			if (cursorIndex === 0 || cursorIndex == this.text.length - 1) {
				return nothing();
			} else {
				return this.splitAtIndex(cursorIndex).map(([firstBlock, secondBlock]) => ({
					in: firstBlock,
					out: secondBlock,
					link: new Link(firstBlock, secondBlock, 'y', 1), // TODO - Get from preferences
					queue: []
				}));
			}
		} else {
			const [selectionStart, selectionEnd] = [selection.anchorOffset, selection.focusOffset].sort();
			if (selectionStart === 0) {
				return this.splitAtIndex(selectionEnd).map(([firstBlock, secondBlock]) => ({
					in: secondBlock,
					out: firstBlock,
					link: new Link(secondBlock, firstBlock, 'y', 1), // TODO - Get from preferences
					queue: []
				}));
			} else if (selectionEnd == this.text.length - 1) {
				return this.splitAtIndex(selectionStart).map(([firstBlock, secondBlock]) => ({
					in: firstBlock,
					out: secondBlock,
					link: new Link(firstBlock, secondBlock, 'y', 1), // TODO - Get from preferences
					queue: []
				}));
			} else {
				return this.splitAtIndex(selectionStart)
					.andThen(([firstBlock, secondAndThirdBlock]) =>
						secondAndThirdBlock
							.splitAtIndex(selectionEnd - selectionStart)
							.map(([secondBlock, thirdBlock]) => [firstBlock, secondBlock, thirdBlock] as const)
					)
					.map(([firstBlock, secondBlock, thirdBlock]) => ({
						in: firstBlock,
						out: secondBlock,
						link: new Link(firstBlock, secondBlock, 'y', 1), // TODO - Get from preferences
						queue: String.isEmpty(thirdBlock.text) ? [] : [thirdBlock]
					}));
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
		return {
			x: this.variables.x.value() + offsetX,
			y: this.variables.y.value() + offsetY
		};
	}

	get height(): number {
		if (this.element) return this.element.clientHeight;
		else {
			const target = document.createElement('div');
			mount(BlockContent, { target, props: { block: this } });
			const renderedBlock = target.children.item(0);
			return renderedBlock?.clientHeight ?? config.block.baseHeight;
		}
	}

	get width(): number {
		return config.block.baseWidth;
	}

	get size(): Record<Dimension, number> {
		return {
			x: this.width,
			y: this.height
		};
	}

	scrollIntoView() {
		this.element?.scrollIntoView({ block: 'center', inline: 'center' });
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
		const mainBlock: 'in' | 'out' = this.sign == 1 ? 'in' : 'out';
		const secondaryBlock: 'in' | 'out' = this.sign == 1 ? 'out' : 'in';
		return {
			main: new kiwi.Constraint(
				this[mainBlock].variables[this.dimension]
					.plus(this[mainBlock].size[this.dimension])
					.plus(config.viewport.defaultGap),
				kiwi.Operator.Le,
				this[secondaryBlock].variables[this.dimension],
				kiwi.Strength.required
			),
			secondary: new kiwi.Constraint(
				this[mainBlock].variables[perpendicularDimension],
				kiwi.Operator.Eq,
				this[secondaryBlock].variables[perpendicularDimension],
				kiwi.Strength.weak
			)
		};
	}
}
