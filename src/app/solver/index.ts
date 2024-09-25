import * as kiwi from '@lume/kiwi';
import type { Link } from '@/link/link.svelte';
import type { Block } from '@/block/block.svelte';
import type { Point, Rectangle } from '@/types';
import RBush from 'rbush';

//

export class ConstraintSolver extends kiwi.Solver {
	/* Block */

	addBlock(block: Block) {
		this.addEditVariable(block.variables.width, kiwi.Strength.strong);
		this.addEditVariable(block.variables.height, kiwi.Strength.strong);
	}

	removeBlock(block: Block) {
		this.removeEditVariable(block.variables.width);
		this.removeEditVariable(block.variables.height);
	}

	updateBlockSize(block: Block, size: Rectangle) {
		const { width, height } = block.variables;
		this.suggestValue(width, size.width);
		this.suggestValue(height, size.height);
		this.updateVariables();
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
}

export class SpaceSolver extends RBush<Block> {
	addBlock(block: Block) {
		if (!this.isBlockInTree(block)) this.insert(block);
	}

	removeBlock(block: Block) {
		if (this.isBlockInTree(block)) this.remove(block);
	}

	updateBlock(block: Block) {
		this.removeBlock(block);
		this.addBlock(block);
	}

	isBlockInTree(block: Block) {
		return this.all().includes(block);
	}
}

export function euclideanDistance(p1: Point, p2: Point) {
	return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
