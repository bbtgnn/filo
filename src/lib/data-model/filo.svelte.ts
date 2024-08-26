import { getContext, setContext, tick } from 'svelte';
import type { Block, BlockSplitResult } from './block.svelte';
import { Link } from './link.svelte';
import type { OnSplit } from '$lib/components/blockContent.svelte';
import { Solver } from './solver';
import { uuidv7 } from 'surrealdb.js';
import * as kiwi from '@lume/kiwi';
import type { Direction } from './types';
import { config } from '$lib/config';
import type RBush from 'rbush';

//

export class Filo {
	blocks = $state<Block[]>([]);
	links = $state<Link[]>([]);

	blockIn = $state<Block | undefined>(undefined);
	blockOut = $state<Block | undefined>(undefined);
	blockQueue = $state<Block | undefined>(undefined);
	currentLink = $state<Link | undefined>(undefined);
	linkQueue = $state<Link | undefined>(undefined);

	blockOrigin = $state<Block | undefined>(undefined);
	blockOriginConstraints = $state<kiwi.Constraint[]>([]);

	solver: Solver;

	redrawKey = $state('');

	//

	constructor() {
		this.solver = new Solver();
	}

	/* Crun */

	addBlock(block: Block) {
		if (this.blocks.length === 0) this.setBlockOrigin(block);
		this.blocks.push(block);
		this.solver.addBlock(block);
	}

	removeBlock(block: Block) {
		this.blocks.splice(this.blocks.indexOf(block), 1);
		this.solver.removeBlock(block);
	}

	addLink(link: Link) {
		this.links.push(link);
		this.solver.addLink(link);
	}

	removeLink(link: Link) {
		this.links.splice(this.links.indexOf(link), 1);
		this.solver.removeLink(link);
	}

	/* Block operations */

	setBlockOrigin(block: Block) {
		this.blockOrigin = block;
		this.blockOriginConstraints.forEach((c) => {
			if (this.solver.hasConstraint(c)) {
				this.solver.removeConstraint(c);
			}
		});
		this.blockOriginConstraints = [
			new kiwi.Constraint(block.variables.x, kiwi.Operator.Eq, 0, kiwi.Strength.strong),
			new kiwi.Constraint(block.variables.y, kiwi.Operator.Eq, 0, kiwi.Strength.strong)
		];
		this.blockOriginConstraints.forEach((c) => this.solver.addConstraint(c));
		this.solver.updateVariables();
		this.solver.updateBlock(block);
	}

	handleBlockSplit: OnSplit = async (splitResult: BlockSplitResult, oldBlock: Block) => {
		this.replaceBlock(oldBlock, splitResult.in);
		this.addBlock(splitResult.out);
		if (splitResult.queue) this.addBlock(splitResult.queue);
		this.blockIn = splitResult.in;
		this.blockOut = splitResult.out;
		this.blockQueue = splitResult.queue;
		if (oldBlock == this.blockOrigin) this.setBlockOrigin(this.blockIn);

		await tick(); // Loads blocks and their height, needed for computing variables

		this.currentLink = new Link(this.blockIn, this.blockOut, 'y', 1); // TODO - Maybe add a setter / getter
		this.addLink(this.currentLink);

		if (this.blockQueue) {
			this.linkQueue = new Link(this.blockOut, this.blockQueue, 'y', 1);
			this.addLink(this.linkQueue);
		}

		this.solver.updateVariables();
		this.redraw();

		console.log(this.solver.tree.data.children);
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
		this.solver.updateVariables();
		this.solver.updateBlock(newBlock);
		console.log(this.solver.tree);
	}

	moveBlockOut({ dimension, sign }: Direction) {
		if (!this.blockIn || !this.blockOut || !this.currentLink) return;

		this.removeLink(this.currentLink);
		this.currentLink = new Link(this.blockIn, this.blockOut, dimension, sign);
		this.addLink(this.currentLink);

		this.solver.updateVariables();
		this.solver.updateBlock(this.blockOut);
		if (this.blockQueue) this.solver.updateBlock(this.blockQueue);

		this.redraw();

		console.log(this.solver.tree.data.children);
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
		const viewCone = this.getBlockViewCone(this.blockIn, direction);
		console.log(viewCone);

		// (viewCone) => this.solver.tree.search(viewCone),
		// (nextRBushBlocks) => {
		// 	if (direction.sign == 1) return nextRBushBlocks.at(0);
		// 	if (direction.sign == -1) return nextRBushBlocks.at(-1);
		// },
		// Option.fromNullable,
		// Option.flatMap((nextRBushBlock) =>
		// 	pipe(
		// 		this.blocks.find((b) => b.id.toString() == nextRBushBlock.id),
		// 		Option.fromNullable
		// 	)
		// ),
		// Option.getOrThrow

		// this.blockIn = nextBlock;
		// this.removeLink(this.currentLink);
		// const { sign, dimension } = this.currentLink;
		// this.currentLink = new Link(this.blockIn, this.blockOut, dimension, sign);
		// this.addLink(this.currentLink);

		// this.solver.updateVariables();
		// this.redraw();
	}

	getBlockViewCone(block: Block, { dimension, sign }: Direction): RBush.BBox {
		let minX: number;
		let maxX: number;
		let minY: number;
		let maxY: number;

		const correction = 10;

		if (dimension == 'x') {
			minY = block.position.y;
			maxY = block.position.y + block.size.height;
			const halfWidth = block.size.width / 2;
			const centerX = block.position.x + halfWidth;
			minX = centerX + sign * (halfWidth + correction);
			maxX = minX + sign * config.maxSearchDistance;
		} else {
			minX = block.position.x;
			maxX = block.position.x + block.size.width;
			const halfHeight = block.size.height / 2;
			const centerY = block.position.y + halfHeight;
			minY = centerY + sign * (halfHeight + correction);
			maxY = minY + sign * config.maxSearchDistance;
		}

		return {
			minX,
			maxX,
			minY,
			maxY
		};
	}

	/* Ui */

	redraw() {
		this.redrawKey = uuidv7();
	}
}

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
