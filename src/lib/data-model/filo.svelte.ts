import { getContext, mount, setContext } from 'svelte';
import type { Block } from './block.svelte';
import type { Link } from './link.svelte';
import FiloComponent from './filo.component.svelte';
import BlockComponent from './block.component.svelte';
import { nanoid } from 'nanoid';
import * as kiwi from '@lume/kiwi';
import { Maybe } from 'true-myth';
import type { OnSplit } from '$lib/components/blockContent.svelte';

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

	solver: kiwi.Solver;

	constructor(target: HTMLElement) {
		this.mount(target);
		this.solver = new kiwi.Solver();

		$effect(() => this.blockIn?.scrollIntoView());
	}

	mount(target: HTMLElement) {
		this.parentHtmlElement = target;
		mount(FiloComponent, {
			target,
			props: { filo: this }
		});
		this.htmlElement = target.querySelector(`#${this.id}`);
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

	getHtmlElement(element: keyof typeof this.ids) {
		return new Maybe(this.htmlElement?.querySelector(`#${this.ids[element]}`));
	}

	handleBlockSplit: OnSplit = (splitResult, oldBlock) => {
		console.log(splitResult, oldBlock);
		// splitResult;
		// oldBlock;
	};
}

//

const APP_STATE_KEY = Symbol('AppState');

export function initFilo(target: HTMLElement) {
	return setFilo(new Filo(target));
}

export function setFilo(filo: Filo) {
	return setContext(APP_STATE_KEY, filo);
}

export function getFilo() {
	return getContext<ReturnType<typeof initFilo>>(APP_STATE_KEY);
}
