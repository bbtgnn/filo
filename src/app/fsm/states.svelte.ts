// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { FiloManager } from './filoManager.svelte';
import { Link } from '@/link/link.svelte';
import type { Block, BlockSplitResult } from '@/block/block.svelte';
import type { Direction } from '@/types';

import { browser } from '$app/environment';
import type { BaseRecord } from '$lib/types';
import { Option, pipe, Array as A } from 'effect';

//

export abstract class FiloBaseState<Context extends BaseRecord = BaseRecord> {
	constructor(
		public manager: FiloManager,
		public context: Context
	) {}
}

//

export class IdleState extends FiloBaseState<Record<string, never>> {
	focusBlock(block: Block) {
		this.manager.nextState('focus', {
			blocks: {
				focused: block
			}
		});
	}
}

//

export class FocusState extends FiloBaseState<{
	blocks: {
		focused: Block;
	};
}> {
	get focusedBlock() {
		return this.context.blocks.focused;
	}

	async splitBlock(): Promise<Command> {
		if (!browser) throw new Error('not_browser');
		const selection = window.getSelection();
		if (!selection) return noop();
		const splitResult = this.focusedBlock.split(selection);
		if (Option.isNone(splitResult)) return noop();

		const { blocks, links } = splitResult.pipe(Option.getOrThrow);
		const { filo } = this.manager;

		return {
			apply: async () => {
				filo.replaceBlock(this.focusedBlock, blocks.in);
				filo.addBlock(blocks.out);
				if (blocks.queue) filo.addBlock(blocks.queue);

				await filo.view.waitForUpdate(); // Loads blocks and their height, needed for computing variables

				filo.addLink(links.active);
				if (links.queue) filo.addLink(links.queue);

				filo.constraintsSolver.updateVariables();
				filo.view.redraw();

				filo.spaceSolver.updateBlock(blocks.in);
				filo.spaceSolver.updateBlock(blocks.out);
				if (blocks.queue) filo.spaceSolver.updateBlock(blocks.queue);

				this.manager.nextState('positioning', { blocks, links });
			},
			undo: async () => {
				filo.replaceBlock(blocks.in, this.focusedBlock);
				filo.removeBlock(blocks.out);
				if (blocks.queue) filo.removeBlock(blocks.queue);

				await filo.view.waitForUpdate();

				filo.removeLink(links.active);
				if (links.queue) filo.removeLink(links.queue);

				filo.constraintsSolver.updateVariables();
				filo.view.redraw();

				filo.spaceSolver.updateBlock(this.focusedBlock);
			}
		};
	}

	focusBlock(block: Block) {
		if (this.focusedBlock == block) return;
		this.manager.nextState('focus', {
			blocks: {
				focused: block
			}
		});
	}

	exit() {
		this.manager.nextState('idle', {});
	}
}

//

export class PositioningState extends FiloBaseState<BlockSplitResult> {
	moveBlockOut({ dimension, sign }: Direction) {
		const { filo } = this.manager;
		const { blocks, links } = this.context;

		filo.removeLink(this.context.links.active);

		const newActiveLink = new Link(blocks.in, blocks.out, dimension, sign);
		filo.addLink(newActiveLink);

		filo.constraintsSolver.updateVariables();
		filo.view.redraw();

		filo.spaceSolver.updateBlock(blocks.out);
		if (blocks.queue) filo.spaceSolver.updateBlock(blocks.queue);

		this.context = { blocks, links: { ...links, active: newActiveLink } };
	}

	confirmBlockOut() {
		const { blocks, links } = this.context;
		if (blocks.queue && links.queue) {
			this.manager.nextState('positioning', {
				blocks: {
					in: blocks.out,
					out: blocks.queue
				},
				links: {
					active: links.queue
				}
			});
		} else {
			this.manager.nextState('focus', {
				blocks: {
					focused: blocks.out
				}
			});
		}
	}

	moveBlockIn(direction: Direction) {
		const { filo } = this.manager;
		const { blocks, links } = this.context;

		const viewCone = blocks.in.getViewCone(direction);
		const newBlockIn = pipe(
			filo.spaceSolver.search(viewCone),
			A.filter((b) => this.manager.getBlockState(b) == 'idle'),
			(foundBlocks) => blocks.in?.getClosestBlock(foundBlocks)
		);

		if (!newBlockIn) return;

		const { sign, dimension } = links.active;
		const newActiveLink = new Link(newBlockIn, blocks.out, dimension, sign);
		filo.removeLink(links.active);
		filo.addLink(newActiveLink);

		filo.constraintsSolver.updateVariables();
		filo.view.redraw();

		this.context = {
			blocks: {
				...blocks,
				in: newBlockIn
			},
			links: {
				...links,
				active: newActiveLink
			}
		};
	}
}

//

interface Command {
	apply: () => void | Promise<void>;
	undo: () => void | Promise<void>;
}

class Noop implements Command {
	constructor() {}
	apply() {}
	undo() {}
}

function noop(): Noop {
	return new Noop();
}
