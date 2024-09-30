// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { browser } from '$app/environment';
import type { BaseRecord } from '$lib/types';
import type { Block, BlockSplitResult } from '@/block/block.svelte';
import type { Filo } from '@/filo/filo.svelte';
import { Link } from '@/link/link.svelte';
import type { Direction } from '@/types';
import { Option, pipe, Array as A } from 'effect';
import { getContext, setContext } from 'svelte';

//

abstract class FiloBaseState<Context extends BaseRecord = BaseRecord> {
	constructor(
		public manager: FiloManager,
		public context: Context
	) {}
}

//

export class IdleState extends FiloBaseState<Record<string, never>> {
	focusBlock(block: Block) {
		this.manager.nextState('focus', {
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

		this.manager.nextState('positioning', { blocks, links });
	}

	exit() {
		this.manager.nextState('idle', {});
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

		this.manager.nextState('positioning', { blocks, links: { ...links, active: newActiveLink } });
	}

	confirmBlockOut() {
		const { blocks, links } = this.context;
		if (blocks.queue && links.queue) {
			this.manager.nextState('positioning', {
				blocks: {
					in: blocks.out,
					out: blocks.queue
				},
				links: {
					active: links.queue
				}
			});
		} else {
			this.manager.nextState('focus', {
				blocks: {
					focused: blocks.out
				}
			});
		}
	}

	moveBlockIn(direction: Direction) {
		const { filo } = this.manager;
		const { blocks, links } = this.context;

		const viewCone = blocks.in.getViewCone(direction);
		const newBlockIn = pipe(
			filo.spaceSolver.search(viewCone),
			A.filter((b) => this.manager.getBlockState(b) == 'idle'),
			(foundBlocks) => blocks.in?.getClosestBlock(foundBlocks)
		);

		if (!newBlockIn) return;

		const { sign, dimension } = links.active;
		const newActiveLink = new Link(newBlockIn, blocks.out, dimension, sign);
		filo.removeLink(links.active);
		filo.addLink(newActiveLink);

		filo.constraintsSolver.updateVariables();
		filo.view.redraw();

		this.manager.nextState('positioning', {
			blocks: {
				...blocks,
				in: newBlockIn
			},
			links: {
				...links,
				active: newActiveLink
			}
		});
	}
}

//

const FiloStates = {
	idle: IdleState,
	focus: FocusState,
	positioning: PositioningState
};

type FiloStateName = keyof typeof FiloStates;
type FiloStateType<S extends FiloStateName> = (typeof FiloStates)[S];

type FiloState<S extends FiloStateName> = InstanceType<FiloStateType<S>>;
type FiloStateContext<S extends FiloStateName> = ConstructorParameters<FiloStateType<S>>[1];

type FiloStateConstructor<S extends FiloStateName> = new (
	manager: FiloManager,
	context: FiloStateContext<S>
) => FiloState<S>;

//

export class FiloManager {
	history = $state<FiloBaseState[]>([new IdleState(this, {})]);
	currentState = $derived(this.history.at(-1));

	constructor(public filo: Filo) {}

	//

	nextState<S extends FiloStateName>(stateName: S, context: FiloStateContext<S>): FiloState<S> {
		const StateClass = FiloStates[stateName] as FiloStateConstructor<S>;
		const stateInstance = new StateClass(this, context);
		this.history.push(stateInstance);
		return stateInstance;
	}

	state<S extends FiloStateName>(stateName: S): FiloState<S> | undefined {
		const StateClass = FiloStates[stateName] as FiloStateConstructor<S>;
		if (this.currentState instanceof StateClass) return this.currentState;
		else return undefined;
	}

	//

	undo(): Option.Option<FiloBaseState> {
		const removedState = Option.fromNullable(this.history.pop());
		if (Option.isNone(removedState)) this.nextState('idle', {});
		return removedState;
	}

	getBlockState(block: Block): BlockState {
		if (this.state('focus')?.context.blocks.focused == block) return 'focus';
		else if (this.state('positioning')?.context.blocks.in == block) return 'in';
		else if (this.state('positioning')?.context.blocks.out == block) return 'out';
		else if (this.state('positioning')?.context.blocks.queue == block) return 'queue';
		else return 'idle';
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
