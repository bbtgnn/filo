import type { Block, Link } from '$lib/db/schema';
import { getContext, setContext } from 'svelte';

//

export class AppState {
	blocks = $state<Block[]>([]);
	links = $state<Link[]>([]);
	blocksQueue = $state<Block[]>([]);

	blockIn = $state<Block | undefined>(undefined);
	blockOut = $state<Block | undefined>(undefined);
	currentLink = $state<Link | undefined>(undefined);

	firstBlock = $derived(this.getFirstBlock(this.blocks));

	getFirstBlock(blocks: Block[]) {
		return blocks
			.filter((block) => [...block.id.id.toString()].every((v) => v == '0'))
			.map((block) => ({ block, depth: block.id.id.toString().length }))
			.at(0)?.block;
	}

	constructor() {}
}

//

const APP_STATE_KEY = Symbol('AppState');

export function setAppState() {
	return setContext(APP_STATE_KEY, new AppState());
}

export function getAppState() {
	return getContext<ReturnType<typeof setAppState>>(APP_STATE_KEY);
}
