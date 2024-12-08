import { Link } from '@/link/link.svelte';
import type { Block } from '@/block/block.svelte';
import type { Direction } from '@/types';

import { browser } from '$app/environment';
import { Option } from 'effect';
import { PositioningState } from './positioningState.svelte';
import { FiloBaseState, IdleState, StateCommand } from './index.svelte';
import { getPerpendicularDimension } from '@/utils';

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

		const blocks = splitResult.pipe(Option.getOrThrow);
		const filo = this.filo;

		return new StateCommand({
			name: this.splitBlock.name,
			apply: async () => {
				filo.replaceBlock(this.focusedBlock, blocks.in);
				filo.addBlock(blocks.out);
				if (blocks.queue) filo.addBlock(blocks.queue);

				await filo.view.waitForUpdate(); // Loads blocks and their height, needed for computing variables

				const sideIn: Direction = { dimension: 'y', sign: 1 };

				const linksOnSide = filo.getBlockLinksBySide(blocks.in, sideIn);
				const lastLinkOnSide = linksOnSide.at(-1);
				if (lastLinkOnSide)
					filo.addOrderConstraint(
						lastLinkOnSide.out.block,
						blocks.out,
						getPerpendicularDimension(sideIn.dimension)
					);

				const orderIn = linksOnSide.length;

				const activeLink = new Link(
					{ block: blocks.in, side: sideIn, order: orderIn },
					{ block: blocks.out, side: { dimension: 'y', sign: -1 }, order: 0 }
				);

				let queueLink: Link | undefined = undefined;
				if (blocks.queue) {
					queueLink = new Link(
						{ block: blocks.out, side: { dimension: 'y', sign: 1 }, order: 0 },
						{ block: blocks.queue, side: { dimension: 'y', sign: -1 }, order: 0 }
					);
				}

				filo.addLink(activeLink);
				if (queueLink) filo.addLink(queueLink);

				filo.constraintsSolver.updateVariables();
				filo.view.redraw();

				filo.spaceSolver.updateBlock(blocks.in);
				filo.spaceSolver.updateBlock(blocks.out);
				if (blocks.queue) filo.spaceSolver.updateBlock(blocks.queue);

				return new PositioningState(filo, {
					blocks,
					links: { active: activeLink, queue: queueLink }
				});
			},
			undo: async () => {
				if (blocks.queue) {
					const linkQueue = filo.getLinkByBlocks(blocks.out, blocks.queue);
					if (Option.isSome(linkQueue)) filo.removeLink(linkQueue.value.id);
				}

				const activeLink = filo.getLinkByBlocks(blocks.in, blocks.out);
				if (Option.isSome(activeLink)) filo.removeLink(activeLink.value.id);

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
