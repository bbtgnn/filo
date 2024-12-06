// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Link } from '@/link/link.svelte';
import type { Block } from '@/block/block.svelte';

import type { MaybePromise } from '$lib/types';
import type { Filo } from '@/filo/filo.svelte';
import { FocusState } from './focusState.svelte';

//

type FiloBaseStateContext = {
	blocks?: Record<string, Block>;
	links?: Record<string, Link>;
};

export abstract class FiloBaseState<Context extends FiloBaseStateContext = FiloBaseStateContext> {
	constructor(
		public filo: Filo,
		public context: Context
	) {}

	noop() {
		return new NoopCommand(this);
	}
}

//

export class IdleState extends FiloBaseState<Record<string, never>> {
	focusBlock(block: Block) {
		return new StateCommand({
			name: this.focusBlock.name,
			apply: () =>
				new FocusState(this.filo, {
					blocks: {
						focused: block
					}
				}),
			undo: () => this
		});
	}
}

//

//

export class StateCommand<
	In extends FiloBaseState = FiloBaseState,
	Out extends FiloBaseState = FiloBaseState
> {
	constructor(
		private data: {
			name: string;
			apply: () => MaybePromise<Out>;
			undo: () => MaybePromise<In>;
		}
	) {}

	get apply() {
		return this.data.apply;
	}

	get undo() {
		return this.data.undo;
	}

	get name() {
		return this.data.name;
	}

	pipe<T>(fn: (command: this) => T) {
		return fn(this);
	}
}

export class NoopCommand<State extends FiloBaseState = FiloBaseState> extends StateCommand<
	State,
	State
> {
	constructor(state: State) {
		super({
			name: 'noop',
			apply: () => state,
			undo: () => state
		});
	}
}

// class NoopError {
// 	readonly _tag = 'NoopError';
// }

// class NotBrowserError {
// 	readonly _tag = 'NotBrowserError';
// }
