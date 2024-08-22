import { getContext, setContext } from 'svelte';
import type { Block } from './block.svelte';
import { Link } from './link.svelte';
import { nanoid } from 'nanoid';
import type { OnSplit } from '$lib/components/blockContent.svelte';
import { Solver } from './solver';

//

export class Filo {
	id = nanoid(5);

	blocks = $state<Block[]>([]);
	links = $state<Link[]>([]);

	blockIn = $state<Block | undefined>(undefined);
	blockOut = $state<Block | undefined>(undefined);
	blocksQueue = $state<Block[]>([]);
	currentLink = $state<Link | undefined>(undefined);

	solver: Solver;

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

	handleBlockSplit: OnSplit = (splitResult, oldBlock) => {
		this.blocks.splice(this.blocks.indexOf(oldBlock), 1);
		this.blocks.push(splitResult.in, splitResult.out);
		if (splitResult.queue) this.blocks.push(splitResult.queue);

		// // TODO - Manage links

		// this.blocksQueue = splitResult.queue;
		// this.blockIn = splitResult.in;
		// this.blockOut = splitResult.out;

		// this.solver.suggestBlockPosition(this.blockIn, oldBlock.position);
		// this.solver.updateVariables();

		// const link = new Link(this.blockIn, this.blockOut, 'y', 1);

		// this.addLink(link);
		// this.currentLink = link;

		// this.solver.updateVariables();
	};
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
