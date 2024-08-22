import { RecordId } from 'surrealdb.js';
import * as kiwi from '@lume/kiwi';
import { String, Tuple } from 'effect';
import type { Point } from '$lib/data-model/types';
import Maybe, { just, nothing } from 'true-myth/maybe';
import { config } from '$lib/config.js';
import { Link } from './link.svelte';

//

export class Block {
	text: string;
	variables: {
		x: kiwi.Variable;
		y: kiwi.Variable;
	};
	id: RecordId;

	element = $state<HTMLElement>();

	//

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

	get position(): Point {
		const offsetX = config.viewport.width / 2;
		const offsetY = config.viewport.height / 2;
		return {
			x: this.variables.x.value() + offsetX,
			y: this.variables.y.value() + offsetY
		};
	}

	get height(): number {
		return this.element?.clientHeight ?? config.block.baseWidth;
	}

	get width(): number {
		return this.element?.clientWidth ?? config.block.baseWidth;
	}

	get size(): Point {
		return {
			x: this.width,
			y: this.height
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

	scrollIntoView() {
		this.element?.scrollIntoView({ block: 'center', inline: 'center' });
	}
}

export type BlockSplitResult = { in: Block; out: Block; queue: Block[]; link: Link };
