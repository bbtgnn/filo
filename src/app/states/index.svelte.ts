import { browser } from '$app/environment';
import type { BaseRecord } from '$lib/types';
import type { Block, BlockSplitResult } from '@/block/block.svelte';
import type { Filo } from '@/filo/filo.svelte';
import { Link } from '@/link/link.svelte';
import type { Direction } from '@/types';
import { Option } from 'effect';
import { getContext, setContext } from 'svelte';

//

abstract class FiloBaseState<Context extends BaseRecord = BaseRecord> {
	constructor(
		public manager: FiloManager,
		public context: Context
	) {}
}

//

export class IdleState extends FiloBaseState {
	focusBlock(block: Block) {
		this.manager.next('FocusState', {
			blocks: {
				focused: block
			}
		});
	}
}

//

export class FocusState extends FiloBaseState<{
	blocks: {
		focused: Block;
	};
}> {
	async splitBlock() {
		if (!browser) throw new Error('not_browser');
		const selection = window.getSelection();
		if (!selection) return;

		const splitResult = this.context.blocks.focused.split(selection);
		if (Option.isNone(splitResult)) return;
		const { blocks, links } = splitResult.pipe(Option.getOrThrow);

		const { filo } = this.manager;

		filo.replaceBlock(this.context.blocks.focused, blocks.in);
		filo.addBlock(blocks.out);
		if (blocks.queue) filo.addBlock(blocks.queue);

		await filo.view.waitForUpdate(); // Loads blocks and their height, needed for computing variables

		filo.addLink(links.active);
		if (links.queue) filo.addLink(links.queue);

		filo.constraintsSolver.updateVariables();
		filo.view.redraw();

		filo.spaceSolver.updateBlock(blocks.in);
		filo.spaceSolver.updateBlock(blocks.out);
		if (blocks.queue) filo.spaceSolver.updateBlock(blocks.queue);

		this.manager.next('PositioningState', { blocks, links });
	}

	exit() {
		this.manager.next('IdleState', {});
	}
}

export class PositioningState extends FiloBaseState<BlockSplitResult> {
	moveBlockOut({ dimension, sign }: Direction) {
		const { filo } = this.manager;
		const { blocks, links } = this.context;

		filo.removeLink(this.context.links.active);

		const newActiveLink = new Link(blocks.in, blocks.out, dimension, sign);
		filo.addLink(newActiveLink);

		filo.constraintsSolver.updateVariables();
		filo.view.redraw();

		filo.spaceSolver.updateBlock(blocks.out);
		if (blocks.queue) filo.spaceSolver.updateBlock(blocks.queue);

		this.manager.next('PositioningState', { blocks, links: { ...links, active: newActiveLink } });
	}

	confirmBlockOut() {
		const { blocks, links } = this.context;
		if (blocks.queue && links.queue) {
			this.manager.next('PositioningState', {
				blocks: {
					in: blocks.out,
					out: blocks.queue
				},
				links: {
					active: links.queue
				}
			});
		} else {
			this.manager.next('FocusState', {
				blocks: {
					focused: blocks.out
				}
			});
		}
	}

	// moveBlockIn(direction: Direction) {
	// 	if (!this.blockIn || !this.currentLink || !this.blockOut) return;

	// 	const viewCone = this.blockIn.getViewCone(direction);
	// 	const nextBlock = pipe(
	// 		this.spaceSolver.search(viewCone),
	// 		A.filter((b) => this.getBlockState(b) == 'idle'),
	// 		(foundBlocks) => this.blockIn?.getClosestBlock(foundBlocks)
	// 	);

	// 	if (!nextBlock) return;

	// 	this.blockIn = nextBlock;
	// 	this.removeLink(this.currentLink);
	// 	const { sign, dimension } = this.currentLink;
	// 	this.currentLink = new Link(this.blockIn, this.blockOut, dimension, sign);
	// 	this.addLink(this.currentLink);

	// 	this.constraintsSolver.updateVariables();
	// 	this.view.redraw();
	// }

	// Add methods
}

//

const FiloStates = {
	PositioningState,
	FocusState,
	IdleState
};

type FiloStateName = keyof typeof FiloStates;

type FiloState<S extends FiloStateName> = InstanceType<(typeof FiloStates)[S]>;

type FiloStateContext<T extends FiloBaseState> = T extends FiloBaseState<infer C> ? C : never;

//

export class FiloManager {
	//

	history = $state<FiloBaseState[]>([new IdleState(this, {})]);
	currentState = $derived(this.history.at(-1));

	constructor(public filo: Filo) {}

	//

	next<S extends FiloStateName>(state: S, context: FiloStateContext<FiloState<S>>): FiloState<S> {
		const State = FiloStates[state];
		// @ts-expect-error Type not working
		return this.history.push(new State(this, context));
	}

	state<S extends FiloStateName>(name: S): FiloState<S> | undefined {
		if (this.currentState instanceof FiloStates[name]) return this.currentState;
		else return undefined;
	}

	//

	undo(): Option.Option<FiloBaseState> {
		const removedState = Option.fromNullable(this.history.pop());
		if (Option.isNone(removedState)) this.next('IdleState', {});
		return removedState;
	}

	getBlockState(block: Block): BlockState {
		if (this.currentState instanceof IdleState) return 'idle';
		else if (this.currentState instanceof FocusState) {
			if (this.currentState.context.blocks.focused == block) return 'focus';
			else return 'idle';
		} else if (this.currentState instanceof PositioningState) {
			if (this.currentState.context.blocks.in == block) return 'in';
			else if (this.currentState.context.blocks.out == block) return 'out';
			else if (this.currentState.context.blocks.queue == block) return 'queue';
			else return 'idle';
		} else return 'idle';
	}
}

export type BlockState = 'idle' | 'in' | 'out' | 'queue' | 'focus';

//

const FILO_MANAGER_CONTEXT_KEY = Symbol('AppState');

export function setFiloManager(manager: FiloManager) {
	return setContext(FILO_MANAGER_CONTEXT_KEY, manager);
}

export function getFiloManager() {
	return getContext<ReturnType<typeof setFiloManager>>(FILO_MANAGER_CONTEXT_KEY);
}
