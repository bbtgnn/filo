import * as kiwi from '@lume/kiwi';
import type { Link } from './link.svelte';
import type { Block } from './block.svelte';
import type { Point, Rectangle } from './types';
import RBush from 'rbush';

//

export class Solver extends kiwi.Solver {
	tree = new RBush<RBushBlock>();

	/* Block */

	addBlock(block: Block) {
		this.tree.insert(blockToRBush(block));
	}

	removeBlock(block: Block) {
		this.tree.remove(blockToRBush(block), (a, b) => {
			return a.id === b.id;
		});
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

	suggestVariableValue(
		variable: kiwi.Variable,
		value: number,
		strength: number = kiwi.Strength.weak
	) {
		this.addEditVariableSafe(variable, strength);
		this.suggestValue(variable, value);
	}
}

export type RBushArea = {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
};

type RBushBlock = RBushArea & {
	id: string;
};

function blockToRBush(block: Block): RBushBlock {
	return {
		minX: block.position.x,
		maxX: block.position.x + block.size.width,
		minY: block.position.y,
		maxY: block.position.y + block.size.height,
		id: block.id.toString()
	};
}
