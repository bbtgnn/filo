// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import * as kiwi from '@lume/kiwi';
import { Option, Record, String, Tuple } from 'effect';
import type { Dimension, Direction, Point, Rectangle, Size } from '@/types';
import { config } from '@/config';
import { Link } from '@/link/link.svelte';
import RBush from 'rbush';
import { euclideanDistance } from '@/solver';
import { RecordId } from 'surrealdb';

//

export class Block {
	id: string;
	text: string;
	variables: Record<Dimension | Size, kiwi.Variable>;

	element = $state<HTMLElement | undefined>(undefined);
	height = $derived.by(() => this.element?.clientHeight ?? config.block.baseHeight);
	width = $derived.by(() => this.element?.clientWidth ?? config.block.baseWidth);

	/* */

	constructor(id: string, text: string) {
		this.id = id;
		this.text = text;
		this.variables = {
			x: new kiwi.Variable(this.id + '_x'),
			y: new kiwi.Variable(this.id + '_y'),
			width: new kiwi.Variable(this.id + '_w'),
			height: new kiwi.Variable(this.id + '_h')
		};
	}

	/* Geometry */

	get x() {
		return this.variables.x.value();
	}
	get y() {
		return this.variables.y.value();
	}

	get position(): Point {
		return {
			x: this.x,
			y: this.y
		};
	}

	get absolutePosition(): Point {
		const offsetX = config.viewport.width / 2;
		const offsetY = config.viewport.height / 2;
		return {
			x: this.x + offsetX,
			y: this.y + offsetY
		};
	}

	get size(): Rectangle {
		return {
			width: this.width,
			height: this.height
		};
	}

	/* Db */

	static get dbName() {
		return 'block' as const;
	}

	get recordId(): RecordId {
		return new RecordId(Block.dbName, this.id);
	}

	serialize(): SerializedBlock {
		return {
			text: this.text,
			variables: Record.map(this.variables, (v) => v.value())
		};
	}

	// TODO - cleanup
	split(selection: Selection): Option.Option<BlockSplitResult> {
		if (selection.isCollapsed) {
			const cursorIndex = selection.anchorOffset;
			if (cursorIndex === 0 || cursorIndex == this.text.length - 1) {
				return Option.none();
			} else {
				return this.splitAtIndex(cursorIndex).pipe(
					Option.map(([firstBlock, secondBlock]) => ({
						blocks: {
							in: firstBlock,
							out: secondBlock
						},
						links: {
							active: new Link(firstBlock, secondBlock, 'y', 1) // TODO - Get from preferences}
						}
					}))
				);
			}
		} else {
			const [selectionStart, selectionEnd] = [selection.anchorOffset, selection.focusOffset].sort();
			if (selectionStart === 0) {
				return this.splitAtIndex(selectionEnd).pipe(
					Option.map(([firstBlock, secondBlock]) => ({
						blocks: {
							in: secondBlock,
							out: firstBlock
						},
						links: {
							active: new Link(secondBlock, firstBlock, 'y', 1) // TODO - Get from preferences
						}
					}))
				);
			} else if (selectionEnd == this.text.length - 1) {
				return this.splitAtIndex(selectionStart).pipe(
					Option.map(([firstBlock, secondBlock]) => ({
						blocks: {
							in: firstBlock,
							out: secondBlock
						},
						links: {
							active: new Link(firstBlock, secondBlock, 'y', 1) // TODO - Get from preferences
						}
					}))
				);
			} else {
				const chunks = [
					this.text.slice(0, selectionStart),
					this.text.slice(selectionStart, selectionEnd),
					this.text.slice(selectionEnd)
				]
					.filter(String.isNonEmpty)
					.map((text, index) => new Block(this.id + index.toString(), text));

				const blockIn = chunks[0];
				const blockOut = chunks[1];
				const blockQueue: Block | undefined = chunks[2];

				return Option.some({
					blocks: {
						in: blockIn,
						out: blockOut,
						queue: blockQueue
					},
					links: {
						active: new Link(blockIn, blockOut, 'y', 1), // TODO - Get from preferences
						queue: blockQueue ? new Link(blockOut, blockQueue, 'y', 1) : undefined
					}
				});
			}
		}
	}

	splitAtIndex(index: number): Option.Option<[Block, Block]> {
		if (index <= 0) return Option.none();
		const chunks = [this.text.slice(0, index), this.text.slice(index)] as const;
		return Option.some(
			Tuple.make(
				new Block(
					this.id + '0', // TODO - refine, mabye some method
					chunks[0]
				),
				new Block(this.id + '1', chunks[1])
			)
		);
	}

	scrollIntoView() {
		this.element?.scrollIntoView({ block: 'center', inline: 'center' });
	}

	getViewCone({ dimension, sign }: Direction): RBush.BBox {
		let minX: number;
		let maxX: number;
		let minY: number;
		let maxY: number;

		const correction = 10;

		if (dimension == 'x') {
			minY = this.position.y;
			maxY = this.position.y + this.size.height;
			if (sign == 1) {
				minX = this.position.x + this.width + correction;
				maxX = minX + config.maxSearchDistance;
			} else {
				minX = this.position.x - correction - config.maxSearchDistance;
				maxX = minX + config.maxSearchDistance;
			}
		} else {
			minX = this.position.x;
			maxX = this.position.x + this.size.width;
			if (sign == 1) {
				minY = this.position.y + correction;
				maxY = minY + config.maxSearchDistance;
			} else {
				minY = this.position.y - correction - config.maxSearchDistance;
				maxY = minY + config.maxSearchDistance;
			}
		}

		return {
			minX,
			maxX,
			minY,
			maxY
		};
	}

	getClosestBlock(blocks: Block[]): Block | undefined {
		return blocks
			.map((block) => ({ block, distance: euclideanDistance(this.position, block.position) }))
			.sort((a, b) => a.distance - b.distance)
			.at(0)?.block;
	}
}

export type BlockSplitResult = {
	blocks: { in: Block; out: Block; queue?: Block };
	links: { active: Link; queue?: Link };
};

export type SerializedBlock = {
	text: string;
	variables: Record<Dimension | Size, number>;
};
