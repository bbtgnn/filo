import { browser } from '$app/environment';
import type { Block } from '@/block/block.svelte';
import type { Filo } from '@/filo/filo.svelte';
import type { Link } from '@/link/link.svelte';
import { Option } from 'effect';

//

export class FiloStateManager {
	constructor(
		public filo: Filo,
		private history: FiloState[] = [new IdleState(this, {})]
	) {}

	push(state: FiloState) {
		this.history.push(state);
	}

	undo(): Option.Option<FiloState> {
		const removedState = Option.fromNullable(this.history.pop());
		if (Option.isNone(removedState)) this.push(new IdleState(this, {}));
		return removedState;
	}
}

//

type FiloState = SplittingState | FocusState | IdleState;

export class IdleState {
	constructor(
		public stack: FiloStateManager,
		public context = {}
	) {}
}

export class SplittingState {
	constructor(
		public stack: FiloStateManager,
		public context: {
			blocks: {
				in: Block;
				out: Block;
				queue?: Block;
				old: Block;
			};
			links: {
				active: Link;
				queue?: Link;
			};
		}
	) {}

	async apply() {
		const {filo} = this.stack
		filo.replaceBlock(this.context.blocks.old, this.context.blocks.in);
		filo.addBlock(this.context.blocks.out);
		if (this.context.blocks.queue) filo.addBlock(this.context.blocks.queue);

		// await this.filo.view.waitForUpdate(); // Loads blocks and their height, needed for computing variables

		// this.filo.addLink(this.context.links.active);

		// if (this.blockQueue) {
		// 	this.linkQueue = new Link(this.blockOut, this.blockQueue, 'y', 1);
		// 	this.addLink(this.linkQueue);
		// }

		// this.filo.constraintsSolver.updateVariables();
		// this.filo.view.redraw();

		// this.filo.spaceSolver.updateBlock(this.blockIn);
		// this.filo.spaceSolver.updateBlock(this.blockOut);
		// if (this.blockQueue) this.spaceSolver.updateBlock(this.blockQueue);

		// this.currentLink = new Link(this.blockIn, this.blockOut, 'y', 1); // TODO - Maybe add a setter / getter
		// this.blockIn = splitResult.in;
		// this.blockOut = splitResult.out;
		// this.blockQueue = splitResult.queue;
	}

	// Add methods
}

//

export class FocusState {
	constructor(
		public filo: Filo,
		public context: {
			blocks: {
				focused: Block;
			};
			// selection: {
			// 	start: number
			// 	end?:number
			// }
		}
	) {}

	splitBlock() {
		if (!browser) throw new Error('not_browser');
		const selection = window.getSelection();
		if (!selection) return;

		const nextState = this.context.blocks.focused.split(selection).pipe(
			Option.map(
				(splitResult) =>
					new SplittingState(this., {
						blocks: {
							in: splitResult.in,
							out: splitResult.out,
							queue: splitResult.queue,
							old: this.context.blocks.focused
						},
						links: {
							active: splitResult.link
						}
					})
			)
		);

		nextState.pipe(
			Option.match({
				onSome: (newState) => this.filo.states.push(newState),
				onNone: () => console.error('splitBlock_fail')
			})
		);
	}
}
