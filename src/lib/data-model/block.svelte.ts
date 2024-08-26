import { RecordId } from 'surrealdb.js';
import * as kiwi from '@lume/kiwi';
import { String, Tuple } from 'effect';
import type { Dimension, Point, Rectangle, Size } from '$lib/data-model/types';
import Maybe, { just, nothing } from 'true-myth/maybe';
import { config } from '$lib/config.js';
import { Link } from './link.svelte';
import type { Filo } from './filo.svelte';

//

export type BlockState = 'idle' | 'in' | 'out' | 'queue';

//

export class Block {
	text: string;
	variables: Record<Dimension | Size, kiwi.Variable> = {
		x: new kiwi.Variable(),
		y: new kiwi.Variable(),
		height: new kiwi.Variable(),
		width: new kiwi.Variable()
	};
	id: RecordId;
	filo: Filo;

	element = $state<HTMLElement | undefined>(undefined);
	height = $derived.by(() => this.element?.clientHeight ?? config.block.baseHeight);
	width = $derived.by(() => this.element?.clientWidth ?? config.block.baseWidth);

	status = $derived.by<BlockState>(() => {
		if (this == this.filo.blockQueue) return 'queue';
		if (this == this.filo.blockIn) return 'in';
		if (this == this.filo.blockOut) return 'out';
		else return 'idle';
	});

	isOrigin = $derived.by(() => this.filo.blockOrigin == this);

	//

	static get dbName() {
		return 'block' as const;
	}

	constructor(filo: Filo, id: string, text: string) {
		this.filo = filo;
		this.text = text;
		this.id = new RecordId(Block.dbName, id);

		this.filo.solver.addEditVariableSafe(this.variables.width, kiwi.Strength.strong);
		this.filo.solver.addEditVariableSafe(this.variables.height, kiwi.Strength.strong);
	}

	get position(): Point {
		return {
			x: this.variables.x.value(),
			y: this.variables.y.value()
		};
	}

	get absolutePosition(): Point {
		const offsetX = config.viewport.width / 2;
		const offsetY = config.viewport.height / 2;
		return {
			x: this.variables.x.value() + offsetX,
			y: this.variables.y.value() + offsetY
		};
	}

	get size(): Rectangle {
		return {
			width: this.width,
			height: this.height
		};
	}

	updateSize(size: Rectangle = { width: this.width, height: this.height }) {
		this.filo.solver.suggestBlockSize(this, size);
		this.filo.solver.updateVariables();
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
					link: new Link(firstBlock, secondBlock, 'y', 1) // TODO - Get from preferences
				}));
			}
		} else {
			const [selectionStart, selectionEnd] = [selection.anchorOffset, selection.focusOffset].sort();
			if (selectionStart === 0) {
				return this.splitAtIndex(selectionEnd).map(([firstBlock, secondBlock]) => ({
					in: secondBlock,
					out: firstBlock,
					link: new Link(secondBlock, firstBlock, 'y', 1) // TODO - Get from preferences
				}));
			} else if (selectionEnd == this.text.length - 1) {
				return this.splitAtIndex(selectionStart).map(([firstBlock, secondBlock]) => ({
					in: firstBlock,
					out: secondBlock,
					link: new Link(firstBlock, secondBlock, 'y', 1) // TODO - Get from preferences
				}));
			} else {
				const chunks = [
					this.text.slice(0, selectionStart),
					this.text.slice(selectionStart, selectionEnd),
					this.text.slice(selectionEnd)
				]
					.filter(String.isNonEmpty)
					.map(
						(text, index) => new Block(this.filo, this.id.id.toString() + index.toString(), text)
					);
				return just({
					in: chunks[0],
					out: chunks[1],
					link: new Link(chunks[0], chunks[1], 'y', 1), // TODO - Get from preferences
					queue: chunks[2]
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
					this.filo,
					this.id.id.toString() + '0', // TODO - refine, mabye some method
					chunks[0]
				),
				new Block(this.filo, this.id.id.toString() + '1', chunks[1])
			)
		);
	}

	scrollIntoView() {
		this.element?.scrollIntoView({ block: 'center', inline: 'center' });
	}
}

export type BlockSplitResult = { in: Block; out: Block; queue?: Block; link: Link };
