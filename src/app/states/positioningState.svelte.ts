import { Link } from '@/link/link.svelte';
import type { BlockSplitResult } from '@/block/block.svelte';
import type { Direction, Sign } from '@/types';

import { pipe, Array as A, Option } from 'effect';
import { FiloBaseState, StateCommand } from './index.svelte';
import { FocusState } from './focusState.svelte';
import { getPerpendicularDimension, UnexpectedError } from '@/utils';

//

export class PositioningState extends FiloBaseState<{
	blocks: BlockSplitResult;
	links: { active: Link; queue?: Link };
}> {
	moveBlockOut({ dimension, sign }: Direction) {
		const filo = this.filo;
		const { blocks, links } = this.context;

		return new StateCommand({
			name: this.moveBlockOut.name,
			apply: () => {
				const newActiveLink = new Link(
					{ block: blocks.in, side: { dimension, sign }, order: 0 },
					{ block: blocks.out, side: { dimension, sign: (sign * -1) as Sign }, order: 0 }
				);

				const blocksOnSide = filo.getBlocksOnSide(blocks.in, { dimension, sign });
				if (blocksOnSide.length >= 1)
					filo.addOrderConstraint(
						blocksOnSide.at(-1)!,
						blocks.out,
						getPerpendicularDimension(dimension)
					);

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
				const activeLink = filo.getLinkByBlocks(blocks.in, blocks.out);
				if (Option.isNone(activeLink)) throw new UnexpectedError();

				filo.removeLink(activeLink.value.id);
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

		const newActiveLink = new Link(
			{ block: newBlockIn, side: { dimension, sign }, order: 0 },
			{ block: blocks.out, side: { dimension, sign: (sign * -1) as Sign }, order: 0 }
		);

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
