// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Link } from '@/link/link.svelte';
import type { Block, BlockSplitResult } from '@/block/block.svelte';
import type { Direction } from '@/types';

import { browser } from '$app/environment';
import type { MaybePromise } from '$lib/types';
import { Option, pipe, Array as A } from 'effect';
import type { Filo } from '@/filo/filo.svelte';

//

type FiloBaseStateContext = {
	blocks?: Record<string, Block>;
	links?: Record<string, Link>;
};

export abstract class FiloBaseState<Context extends FiloBaseStateContext = FiloBaseStateContext> {
	constructor(
		public filo: Filo,
		public context: Context
	) {}

	noop() {
		return new NoopCommand(this);
	}
}

//

export class IdleState extends FiloBaseState<Record<string, never>> {
	focusBlock(block: Block) {
		return new StateCommand({
			name: this.focusBlock.name,
			apply: () =>
				new FocusState(this.filo, {
					blocks: {
						focused: block
					}
				}),
			undo: () => this
		});
	}
}

//

export class FocusState extends FiloBaseState<{
	blocks: {
		focused: Block;
	};
}> {
	private get focusedBlock() {
		return this.context.blocks.focused;
	}

	splitBlock() {
		if (!browser) return this.noop();
		const selection = window.getSelection();
		if (!selection) return this.noop();
		const splitResult = this.focusedBlock.split(selection);
		if (Option.isNone(splitResult)) return this.noop();

		const { blocks, links } = splitResult.pipe(Option.getOrThrow);
		const filo = this.filo;

		return new StateCommand({
			name: this.splitBlock.name,
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

				return new PositioningState(filo, { blocks, links });
			},
			undo: async () => {
				if (links.queue) filo.removeLink(links.queue.id);
				filo.removeLink(links.active.id);

				if (blocks.queue) filo.removeBlock(blocks.queue.id);
				filo.removeBlock(blocks.out.id);
				filo.replaceBlock(blocks.in, this.focusedBlock);

				await filo.view.waitForUpdate();

				filo.constraintsSolver.updateVariables();
				filo.view.redraw();

				filo.spaceSolver.updateBlock(this.focusedBlock);

				return this;
			}
		});
	}

	focusBlock(block: Block) {
		if (this.focusedBlock == block) return this.noop();
		return new StateCommand({
			name: this.focusBlock.name,
			apply: () =>
				new FocusState(this.filo, {
					blocks: {
						focused: block
					}
				}),
			undo: () => this
		});
	}

	exit() {
		return new StateCommand({
			name: this.exit.name,
			apply: () => new IdleState(this.filo, {}),
			undo: () => this
		});
	}
}

//

export class PositioningState extends FiloBaseState<BlockSplitResult> {
	moveBlockOut({ dimension, sign }: Direction) {
		const filo = this.filo;
		const { blocks, links } = this.context;
		const newActiveLink = new Link(blocks.in, blocks.out, dimension, sign);

		return new StateCommand({
			name: this.moveBlockOut.name,
			apply: () => {
				filo.removeLink(this.context.links.active.id);
				filo.addLink(newActiveLink);

				filo.constraintsSolver.updateVariables();
				filo.view.redraw();

				filo.spaceSolver.updateBlock(blocks.out);
				if (blocks.queue) filo.spaceSolver.updateBlock(blocks.queue);

				return new PositioningState(filo, {
					blocks,
					links: { ...links, active: newActiveLink }
				});
			},
			undo: () => {
				filo.removeLink(newActiveLink.id);
				filo.addLink(this.context.links.active);

				filo.constraintsSolver.updateVariables();
				filo.view.redraw();

				filo.spaceSolver.updateBlock(blocks.out);
				if (blocks.queue) filo.spaceSolver.updateBlock(blocks.queue);

				return this;
			}
		});
	}

	confirmBlockOut() {
		const { blocks, links } = this.context;
		return new StateCommand({
			name: this.confirmBlockOut.name,
			apply: () => {
				if (blocks.queue && links.queue) {
					return new PositioningState(this.filo, {
						blocks: {
							in: blocks.out,
							out: blocks.queue
						},
						links: {
							active: links.queue
						}
					});
				} else {
					return new FocusState(this.filo, {
						blocks: {
							focused: blocks.out
						}
					});
				}
			},
			undo: () => this
		});
	}

	moveBlockIn(direction: Direction) {
		const filo = this.filo;
		const { blocks, links } = this.context;

		const viewCone = blocks.in.getViewCone(direction);
		const newBlockIn = pipe(
			filo.spaceSolver.search(viewCone),
			A.filter((b) => !Object.values(this.context.blocks).includes(b)),
			(foundBlocks) => blocks.in?.getClosestBlock(foundBlocks)
		);

		if (!newBlockIn) return this.noop();

		const { sign, dimension } = links.active;
		const newActiveLink = new Link(newBlockIn, blocks.out, dimension, sign);

		return new StateCommand({
			name: this.moveBlockIn.name,
			apply: () => {
				filo.removeLink(links.active.id);
				filo.addLink(newActiveLink);

				filo.constraintsSolver.updateVariables();
				filo.view.redraw();

				return new PositioningState(this.filo, {
					blocks: {
						...blocks,
						in: newBlockIn
					},
					links: {
						...links,
						active: newActiveLink
					}
				});
			},
			undo: () => {
				filo.removeLink(newActiveLink.id);
				filo.addLink(links.active);

				filo.constraintsSolver.updateVariables();
				filo.view.redraw();

				return this;
			}
		});
	}
}

//

export class StateCommand<
	In extends FiloBaseState = FiloBaseState,
	Out extends FiloBaseState = FiloBaseState
> {
	constructor(
		private data: {
			name: string;
			apply: () => MaybePromise<Out>;
			undo: () => MaybePromise<In>;
		}
	) {}

	get apply() {
		return this.data.apply;
	}

	get undo() {
		return this.data.undo;
	}

	get name() {
		return this.data.name;
	}

	pipe<T>(fn: (command: this) => T) {
		return fn(this);
	}
}

export class NoopCommand<State extends FiloBaseState = FiloBaseState> extends StateCommand<
	State,
	State
> {
	constructor(state: State) {
		super({
			name: 'noop',
			apply: () => state,
			undo: () => state
		});
	}
}

// class NoopError {
// 	readonly _tag = 'NoopError';
// }

// class NotBrowserError {
// 	readonly _tag = 'NotBrowserError';
// }
