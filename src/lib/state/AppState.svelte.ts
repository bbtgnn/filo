import type { Block, Link } from '$lib/db/schema.svelte';
import { getContext, setContext } from 'svelte';
import * as kiwi from '@lume/kiwi';

//

export class AppState {
	blocks = $state<Block[]>([]);
	links = $state<Link[]>([]);
	blocksQueue = $state<Block[]>([]);
	originConstraints = $state<kiwi.Constraint[]>([]);

	blockIn = $state<Block | undefined>(undefined);
	blockOut = $state<Block | undefined>(undefined);
	currentLink = $state<Link | undefined>(undefined);

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
