import { getContext, setContext } from 'svelte';
import { Block } from '@/block/block.svelte';
import { type BlockSplitResult } from '@/block/block.svelte';
import { Link } from '@/link/link.svelte';
import type { OnSplit } from '@/block/blockContent.svelte';
import { ConstraintSolver, SpaceSolver } from '@/solver';
import * as kiwi from '@lume/kiwi';
import type { Direction, Rectangle } from '@/types';
import { pipe, Array as A } from 'effect';
import { nanoid } from 'nanoid';
import { View } from '@/view/view.svelte';

//

export class Filo {
	id: string;

	view = new View();
	constraintsSolver = new ConstraintSolver();
	spaceSolver = new SpaceSolver();

	//

	blocks = $state<Block[]>([]);
	links = $state<Link[]>([]);

	origin = $state<{ block: Block; constraints: kiwi.Constraint[] } | undefined>(undefined);

	blockIn = $state<Block | undefined>(undefined);
	blockOut = $state<Block | undefined>(undefined);
	blockQueue = $state<Block | undefined>(undefined);

	currentLink = $state<Link | undefined>(undefined);
	linkQueue = $state<Link | undefined>(undefined);

	//

	constructor(id = nanoid(7)) {
		this.id = id;
	}

	/* CRUD */

	addBlock(block: Block) {
		this.blocks.push(block);
		this.constraintsSolver.addBlock(block);
		this.spaceSolver.addBlock(block);
		if (this.blocks.length == 1) this.setBlockOrigin(block);
	}

	removeBlock(block: Block) {
		this.blocks.splice(this.blocks.indexOf(block), 1);
		this.constraintsSolver.removeBlock(block);
		this.spaceSolver.removeBlock(block);
		if (this.blocks.length == 0) this.removeBlockOrigin();
	}

	updateBlockSize(block: Block, size: Rectangle) {
		this.constraintsSolver.updateBlockSize(block, size);
	}

	addLink(link: Link) {
		this.links.push(link);
		this.constraintsSolver.addLink(link);
	}

	removeLink(link: Link) {
		this.links.splice(this.links.indexOf(link), 1);
		this.constraintsSolver.removeLink(link);
	}

	/* Block operations */

	setBlockOrigin(block: Block) {
		this.origin?.constraints.forEach((c) => this.constraintsSolver.removeConstraint(c));
		this.origin = {
			block,
			constraints: [
				new kiwi.Constraint(block.variables.x, kiwi.Operator.Eq, 0, kiwi.Strength.strong),
				new kiwi.Constraint(block.variables.y, kiwi.Operator.Eq, 0, kiwi.Strength.strong)
			]
		};
		this.origin.constraints.forEach((c) => this.constraintsSolver.addConstraint(c));
		this.constraintsSolver.updateVariables();
		this.blocks.forEach((b) => this.spaceSolver.updateBlock(b));
	}

	removeBlockOrigin() {
		this.origin?.constraints.forEach((c) => this.constraintsSolver.removeConstraint(c));
		this.origin = undefined;
	}

	handleBlockSplit: OnSplit = async (splitResult: BlockSplitResult, oldBlock: Block) => {
		this.replaceBlock(oldBlock, splitResult.in);
		this.addBlock(splitResult.out);
		if (splitResult.queue) this.addBlock(splitResult.queue);
		this.blockIn = splitResult.in;
		this.blockOut = splitResult.out;
		this.blockQueue = splitResult.queue;

		await this.view.waitForUpdate(); // Loads blocks and their height, needed for computing variables

		this.currentLink = new Link(this.blockIn, this.blockOut, 'y', 1); // TODO - Maybe add a setter / getter
		this.addLink(this.currentLink);

		if (this.blockQueue) {
			this.linkQueue = new Link(this.blockOut, this.blockQueue, 'y', 1);
			this.addLink(this.linkQueue);
		}

		this.constraintsSolver.updateVariables();
		this.view.redraw();

		this.spaceSolver.updateBlock(this.blockIn);
		this.spaceSolver.updateBlock(this.blockOut);
		if (this.blockQueue) this.spaceSolver.updateBlock(this.blockQueue);
	};

	replaceBlock(oldBlock: Block, newBlock: Block) {
		const linksToRemove = this.links.filter((link) => link.in == oldBlock || link.out == oldBlock);
		const newLinks = linksToRemove.map((oldLink) => {
			if (oldLink.in == oldBlock) {
				return new Link(newBlock, oldLink.out, oldLink.dimension, oldLink.sign);
			} else {
				return new Link(oldLink.in, newBlock, oldLink.dimension, oldLink.sign);
			}
		});

		for (const link of linksToRemove) this.removeLink(link);
		for (const link of newLinks) this.addLink(link);

		this.removeBlock(oldBlock);
		this.addBlock(newBlock);
		this.constraintsSolver.updateVariables();
		if (oldBlock == this.origin?.block) this.setBlockOrigin(newBlock);

		this.spaceSolver.updateBlock(newBlock);
	}

	moveBlockOut({ dimension, sign }: Direction) {
		if (!this.blockIn || !this.blockOut || !this.currentLink) return;

		this.removeLink(this.currentLink);
		this.currentLink = new Link(this.blockIn, this.blockOut, dimension, sign);
		this.addLink(this.currentLink);

		this.constraintsSolver.updateVariables();
		this.view.redraw();

		this.spaceSolver.updateBlock(this.blockOut);
		if (this.blockQueue) this.spaceSolver.updateBlock(this.blockQueue);
	}

	confirmBlockOut() {
		if (!this.blockIn || !this.blockOut || !this.currentLink) return;

		if (!this.blockQueue) {
			this.blockIn = undefined;
			this.blockOut = undefined;
			this.currentLink = undefined;
		} else {
			this.blockIn = this.blockOut;
			this.blockOut = this.blockQueue;
			this.blockQueue = undefined;
			this.currentLink = this.linkQueue;
			this.linkQueue = undefined;
		}
	}

	moveBlockIn(direction: Direction) {
		if (!this.blockIn || !this.currentLink || !this.blockOut) return;

		const viewCone = this.blockIn.getViewCone(direction);
		const nextBlock = pipe(
			this.spaceSolver.search(viewCone),
			A.filter((b) => this.getBlockState(b) == 'idle'),
			(foundBlocks) => this.blockIn?.getClosestBlock(foundBlocks)
		);

		if (!nextBlock) return;

		this.blockIn = nextBlock;
		this.removeLink(this.currentLink);
		const { sign, dimension } = this.currentLink;
		this.currentLink = new Link(this.blockIn, this.blockOut, dimension, sign);
		this.addLink(this.currentLink);

		this.constraintsSolver.updateVariables();
		this.view.redraw();
	}

	getBlockState(block: Block): BlockState {
		if (this.blockIn == block) return 'in';
		else if (this.blockOut == block) return 'out';
		else if (this.blockQueue == block) return 'queue';
		else return 'idle';
	}
}

//

export type SerializedAppState = {
	blockIn: string | undefined;
	blockOut: string | undefined;
	blockQueue: string | undefined;
	currentLink: string | undefined;
	linkQueue: string | undefined;
	blockOrigin: string | undefined;
};

export type BlockState = 'idle' | 'in' | 'out' | 'queue';

//

const FILO_CONTEXT_KEY = Symbol('AppState');

export function initFilo() {
	return setFilo(new Filo());
}

export function setFilo(filo: Filo) {
	return setContext(FILO_CONTEXT_KEY, filo);
}

export function getFilo() {
	return getContext<ReturnType<typeof initFilo>>(FILO_CONTEXT_KEY);
}
