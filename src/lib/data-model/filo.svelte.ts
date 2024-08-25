import { getContext, setContext, tick } from 'svelte';
import { Block, type BlockSplitResult } from './block.svelte';
import { Link } from './link.svelte';
import type { OnSplit } from '$lib/components/blockContent.svelte';
import { Solver } from './solver';
import { uuidv7 } from 'surrealdb.js';
import * as kiwi from '@lume/kiwi';
// import { DirectedGraph } from 'graphology';

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

	loadText(text: string) {
		if (this.blocks.length > 0) throw new Error('Cannot use loadText if blocks are present');
		const block = new Block(this, '0', text);
		this.setBlockOrigin(block);
		this.blocks.push(block);
		this.solver.addBlock(block);
	}

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
	}

	removeBlock(block: Block) {
		this.blocks.splice(this.blocks.indexOf(block), 1);
		this.solver.removeBlock(block);
	}

	removeLink(link: Link) {
		this.links.splice(this.links.indexOf(link), 1);
		this.solver.removeLink(link);
	}

	handleBlockSplit: OnSplit = async (splitResult: BlockSplitResult, oldBlock: Block) => {
		this.replaceBlock(oldBlock, splitResult.in);
		this.blockIn = splitResult.in;
		this.blockOut = splitResult.out;
		this.blockQueue = splitResult.queue;
		if (oldBlock == this.blockOrigin) this.setBlockOrigin(this.blockIn);

		await tick(); // Loads blocks and their height, needed for computing variables
		this.solver.updateVariables();

		this.currentLink = new Link(this.blockIn, this.blockOut, 'y', 1);
		this.solver.addLink(this.currentLink);

		if (this.blockQueue) {
			this.linkQueue = new Link(this.blockOut, this.blockQueue, 'y', 1);
			this.solver.addLink(this.linkQueue);
		}

		this.solver.updateVariables();
		this.redraw();
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
		for (const link of newLinks) {
			this.links.push(link);
			this.solver.addLink(link);
		}

		this.removeBlock(oldBlock);
		this.blocks.push(newBlock);
		this.solver.addBlock(newBlock);
	}

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
