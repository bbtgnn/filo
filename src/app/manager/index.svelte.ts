// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Filo } from '@/filo/filo.svelte';
import type { Block } from '@/block/block.svelte';
import {
	FiloBaseState,
	FocusState,
	IdleState,
	PositioningState,
	type StateCommand
} from '@/states/index.svelte';

import { getContext, setContext } from 'svelte';

/* Types mumbo-jumbo (the real deal) */

type FiloStates = typeof FiloManager.states;

type FiloStateName = keyof FiloStates;
type FiloStateType<S extends FiloStateName> = FiloStates[S];

type FiloState<S extends FiloStateName> = InstanceType<FiloStateType<S>>;
type FiloStateContext<S extends FiloStateName> = ConstructorParameters<FiloStateType<S>>[1];

type FiloStateClass<S extends FiloStateName> = new (
	filo: Filo,
	context: FiloStateContext<S>
) => FiloState<S>;

/* - */

export class FiloManager {
	stateHistory = $state<FiloBaseState[]>([]);
	currentState = $derived(this.stateHistory.at(-1));

	undoStack = $state<StateCommand[]>([]);
	redoStack = $state<StateCommand[]>([]);

	static states = {
		idle: IdleState,
		focus: FocusState,
		positioning: PositioningState
	};

	constructor(public filo: Filo) {
		this.nextState('idle', {});
	}

	//

	async run(command: StateCommand) {
		const nextState = await command.apply();
		this.undoStack.push(command);
		if (this.currentState?.context == nextState.context) return;
		this.stateHistory.push(nextState);
	}

	async undo() {
		const lastCommand = this.undoStack.pop();
		if (!lastCommand) return; // TODO - Improve
		await lastCommand.undo();
		const lastState = this.stateHistory.pop();
		if (!lastState) this.nextState('idle', {});
	}

	//

	nextState<S extends FiloStateName>(stateName: S, context: FiloStateContext<S>): FiloState<S> {
		const StateClass = this.getStateClass(stateName);
		const stateInstance = new StateClass(this.filo, context);
		this.stateHistory.push(stateInstance);
		return stateInstance;
	}

	state<S extends FiloStateName>(stateName: S): FiloState<S> | undefined {
		const StateClass = this.getStateClass(stateName);
		if (this.currentState instanceof StateClass) return this.currentState;
		else return undefined;
	}

	getStateClass<S extends FiloStateName>(stateName: S) {
		return FiloManager.states[stateName] as FiloStateClass<S>;
	}

	//

	getBlockState(block: Block): BlockState {
		if (this.state('focus')?.context.blocks.focused == block) return 'focus';
		else if (this.state('positioning')?.context.blocks.in == block) return 'in';
		else if (this.state('positioning')?.context.blocks.out == block) return 'out';
		else if (this.state('positioning')?.context.blocks.queue == block) return 'queue';
		else return 'idle';
	}
}

export type BlockState = 'idle' | 'in' | 'out' | 'queue' | 'focus';

/* Context */

const FILO_MANAGER_CONTEXT_KEY = Symbol('AppState');

export function setFiloManager(manager: FiloManager) {
	return setContext(FILO_MANAGER_CONTEXT_KEY, manager);
}

export function getFiloManager() {
	return getContext<ReturnType<typeof setFiloManager>>(FILO_MANAGER_CONTEXT_KEY);
}
