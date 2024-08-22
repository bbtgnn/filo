import { getContext, mount, setContext } from 'svelte';
import type { Block } from './block.svelte';
import { Link } from './link.svelte';
import BlockComponent from './blockComponent.svelte';
import { nanoid } from 'nanoid';
import { Maybe } from 'true-myth';
import type { OnSplit } from '$lib/components/blockContent.svelte';
import { Solver } from './solver';

//

export class Filo {
	id = nanoid(5);
	ids = {
		viewport: `filo-viewport-${this.id}`,
		blockCanvas: `filo-block-canvas-${this.id}`,
		linkCanvas: `filo-link-canvas-${this.id}`
	};

	blocks = $state<Block[]>([]);
	links = $state<Link[]>([]);
	blocksQueue = $state<Block[]>([]);

	blockIn = $state<Block | undefined>(undefined);
	blockOut = $state<Block | undefined>(undefined);
	currentLink = $state<Link | undefined>(undefined);

	parentHtmlElement = $state<HTMLElement | null>(null);
	htmlElement = $state<HTMLElement | null>(null);

	solver: Solver;

	constructor() {
		this.solver = new Solver();

		$effect(() => this.blockIn?.scrollIntoView());
	}

	addBlock(block: Block) {
		this.blocks.push(block);
		this.getHtmlElement('blockCanvas').map((blockCanvas) =>
			mount(BlockComponent, {
				target: blockCanvas,
				props: { block, onSplit: this.handleBlockSplit }
			})
		);
	}

	addLink(link: Link) {
		this.links.push(link);
		this.solver.addLink(link);
	}

	getHtmlElement(element: keyof typeof this.ids) {
		return new Maybe(this.htmlElement?.querySelector(`#${this.ids[element]}`));
	}

	handleBlockSplit: OnSplit = (splitResult, oldBlock) => {
		this.blocks.splice(this.blocks.indexOf(oldBlock), 1);
		this.blocks.push(splitResult.in);

		// TODO - Manage links

		this.blocksQueue = splitResult.queue;
		this.blockIn = splitResult.in;
		this.blockOut = splitResult.out;

		this.solver.suggestBlockPosition(this.blockIn, oldBlock.position);
		this.solver.updateVariables();

		const link = new Link(this.blockIn, this.blockOut, 'y', 1);

		this.addLink(link);
		this.currentLink = link;

		this.solver.updateVariables();
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
