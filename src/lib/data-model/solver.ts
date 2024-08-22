import * as kiwi from '@lume/kiwi';
import type { Link } from './link.svelte';
import type { Block } from './block.svelte';
import type { Point } from './types';

//

export class Solver extends kiwi.Solver {
	addEditVariableSafe(variable: kiwi.Variable, strength: number = kiwi.Strength.weak) {
		if (!this.hasEditVariable(variable)) {
			// @ts-expect-error dunno
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

	// getBlockPositionConstraints(
	// 	block: Block,
	// 	position: Point,
	// 	strength: number = kiwi.Strength.required
	// ) {
	// 	return [
	// 		new kiwi.Constraint(block.variables.x, kiwi.Operator.Eq, position.x, strength),
	// 		new kiwi.Constraint(block.variables.y, kiwi.Operator.Eq, position.y, strength)
	// 	];
	// }

	suggestVariableValue(
		variable: kiwi.Variable,
		value: number,
		strength: number = kiwi.Strength.weak
	) {
		this.addEditVariableSafe(variable, strength);
		this.suggestValue(variable, value);
	}

	suggestBlockPosition(block: Block, position: Point, strength: number = kiwi.Strength.weak) {
		const { x, y } = block.variables;
		this.suggestVariableValue(x, position.x, strength);
		this.suggestVariableValue(y, position.y, strength);
	}
}
