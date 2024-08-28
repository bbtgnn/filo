import * as kiwi from '@lume/kiwi';
import type { Link } from './link.svelte';
import type { Block } from './block.svelte';
import type { Point, Rectangle } from './types';
import RBush from 'rbush';

//

export class Solver extends kiwi.Solver {
	tree = new RBush<Block>();

	/* Block */

	addBlock(block: Block) {
		if (!this.isBlockInTree(block)) this.tree.insert(block);
	}

	removeBlock(block: Block) {
		this.tree.remove(block);
	}

	isBlockInTree(block: Block) {
		return this.tree.all().includes(block);
	}

	updateBlock(block: Block) {
		this.removeBlock(block);
		this.addBlock(block);
	}

	/* Link */

	addLink(link: Link) {
		this.addConstraint(link.constraints.main);
		this.addConstraint(link.constraints.secondary);
	}

	removeLink(link: Link) {
		this.removeConstraint(link.constraints.main);
		this.removeConstraint(link.constraints.secondary);
	}

	suggestBlockPosition(block: Block, position: Point, strength: number = kiwi.Strength.weak) {
		const { x, y } = block.variables;
		this.suggestVariableValue(x, position.x, strength);
		this.suggestVariableValue(y, position.y, strength);
	}

	suggestBlockSize(block: Block, size: Rectangle, strength: number = kiwi.Strength.weak) {
		const { width, height } = block.variables;
		this.suggestVariableValue(width, size.width, strength);
		this.suggestVariableValue(height, size.height, strength);
	}

	/* Variables */

	addEditVariableSafe(variable: kiwi.Variable, strength: number = kiwi.Strength.weak) {
		if (!this.hasEditVariable(variable)) {
			// @ts-expect-error dunno
			this.addEditVariable(variable, strength);
		}
	}

	removeConstraintSafe(constraint: kiwi.Constraint) {
		if (this.hasConstraint(constraint)) this.removeConstraint(constraint);
	}

	suggestVariableValue(
		variable: kiwi.Variable,
		value: number,
		strength: number = kiwi.Strength.weak
	) {
		this.addEditVariableSafe(variable, strength);
		this.suggestValue(variable, value);
	}
}

export function euclideanDistance(p1: Point, p2: Point) {
	return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
