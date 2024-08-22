import { getContext, setContext, tick } from 'svelte';
import type { Block, BlockSplitResult } from './block.svelte';
import { Link } from './link.svelte';
import type { OnSplit } from '$lib/components/blockContent.svelte';
import { Solver } from './solver';
import { uuidv7 } from 'surrealdb.js';

//

export class Filo {
	blocks = $state<Block[]>([]);
	links = $state<Link[]>([]);

	blockIn = $state<Block | undefined>(undefined);
	blockOut = $state<Block | undefined>(undefined);
	blockQueue = $state<Block | undefined>(undefined);
	currentLink = $state<Link | undefined>(undefined);
	linkQueue = $state<Link | undefined>(undefined);

	solver: Solver;

	redrawKey = $state('');

	constructor() {
		this.solver = new Solver();

		$effect(() => this.blockIn?.scrollIntoView());
	}

	addBlock(block: Block) {
		this.blocks.push(block);
	}

	addLink(link: Link) {
		this.links.push(link);
		this.solver.addLink(link);
	}

	removeLink(link: Link) {
		this.links.splice(this.links.indexOf(link), 1);
		this.solver.removeLink(link);
	}

	handleBlockSplit: OnSplit = async (splitResult: BlockSplitResult, oldBlock: Block) => {
		this.blocks.splice(this.blocks.indexOf(oldBlock), 1);
		this.blocks.push(splitResult.in, splitResult.out);
		if (splitResult.queue) this.blocks.push(splitResult.queue);

		this.blockIn = splitResult.in;
		this.blockOut = splitResult.out;
		this.blockQueue = splitResult.queue;

		await tick(); // Loads blocks and their height

		// TODO - maybe - suggest position

		const link = new Link(this.blockIn, this.blockOut, 'y', 1);
		this.addLink(link);
		this.currentLink = link;

		if (this.blockQueue) {
			const link = new Link(this.blockOut, this.blockQueue, 'y', 1);
			this.addLink(link);
			this.linkQueue = link;
		}

		this.solver.updateVariables();
		this.redraw();
	};

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
