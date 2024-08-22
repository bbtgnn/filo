import * as kiwi from '@lume/kiwi';
import type { Block } from './block.svelte';
import type { Link } from './link.svelte';
import type { Point } from './types';

//

export class Solver extends kiwi.Solver {
	suggestBlockPosition(block: Block, point: Point, strength: number = kiwi.Strength.weak) {
		const { x, y } = block.variables;
		this.addEditVariable(x, strength);
		this.suggestValue(x, point.x);
		this.addEditVariable(y, strength);
		this.suggestValue(y, point.y);
	}

	addEditVariable(variable: kiwi.Variable, strength: number = kiwi.Strength.weak) {
		if (!this.hasEditVariable(variable)) {
			this.addEditVariable(variable, strength);
		}
	}

	addLink(link: Link) {
		this.addConstraint(link.constraints.main);
		this.addConstraint(link.constraints.secondary);
	}

	removeLink(link: Link) {
		this.removeConstraint(link.constraints.main);
		this.removeConstraint(link.constraints.secondary);
	}

	getBlockPositionConstraints(
		block: Block,
		position: Point,
		strength: number = kiwi.Strength.required
	) {
		return [
			new kiwi.Constraint(block.variables.x, kiwi.Operator.Eq, position.x, strength),
			new kiwi.Constraint(block.variables.y, kiwi.Operator.Eq, position.y, strength)
		];
	}
}
