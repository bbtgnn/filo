import { getContext, setContext, tick } from 'svelte';
import type { Block, BlockSplitResult } from './block.svelte';
import { Link } from './link.svelte';
import type { OnSplit } from '$lib/components/blockContent.svelte';
import { Solver } from './solver';
import { uuidv7 } from 'surrealdb.js';
import { DirectedGraph } from 'graphology';

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
	graph = new DirectedGraph<Block, Link>();

	redrawKey = $state('');

	constructor() {
		this.solver = new Solver();

		$effect(() => this.blockIn?.scrollIntoView());
	}

	addBlock(block: Block) {
		this.blocks.push(block);
		this.graph.addNode(block.id.toJSON(), block);
	}

	removeBlock(block: Block) {
		this.graph.dropNode(block.id.toString());
		this.blocks.splice(this.blocks.indexOf(block), 1);
	}

	addLink(link: Link) {
		this.links.push(link);
		this.solver.addLink(link);
		this.graph.addEdge(link.in.id.toString(), link.out.id.toString(), link);
	}

	removeLink(link: Link) {
		this.links.splice(this.links.indexOf(link), 1);
		this.solver.removeLink(link);
		this.graph.dropEdge(link.in.id.toString(), link.out.id.toString());
	}

	handleBlockSplit: OnSplit = async (splitResult: BlockSplitResult, oldBlock: Block) => {
		this.addBlock(splitResult.in);
		this.addBlock(splitResult.out);
		if (splitResult.queue) this.addBlock(splitResult.queue);
		this.blockIn = splitResult.in;
		this.blockOut = splitResult.out;
		this.blockQueue = splitResult.queue;

		this.replaceBlock(oldBlock, splitResult.in); // Must be called after storing new blocks in app
		this.solver.updateVariables();

		await tick(); // Loads blocks and their height, needed for computing variables

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

	replaceBlock(oldBlock: Block, newBlock: Block) {
		const linksToRemove = this.graph
			.edges(oldBlock.id.toString())
			.map((graphologyId) => this.graph.getEdgeAttributes(graphologyId))
			.map((linkAttributes) =>
				this.links.find((link) => link.id.toString() == linkAttributes.id.toString())
			)
			.filter((link) => link instanceof Link);

		const newLinks = linksToRemove.map((oldLink) => {
			if (oldLink.in.id.toString() == newBlock.id.toString()) {
				return new Link(newBlock, oldLink.out, oldLink.dimension, oldLink.sign);
			} else {
				return new Link(oldLink.in, newBlock, oldLink.dimension, oldLink.sign);
			}
		});

		for (const link of linksToRemove) this.removeLink(link);
		for (const link of newLinks) this.addLink(link);
		this.removeBlock(oldBlock);
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
