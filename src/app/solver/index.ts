// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

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
	/* Data format adapting */

	toBBox(block: Block): RBush.BBox {
		const minX = block.x;
		const minY = block.y;
		const maxX = minX + block.variables.width.value();
		const maxY = minY + block.variables.height.value();
		return {
			minX,
			minY,
			maxX,
			maxY
		};
	}

	compareMinX(a: Block, b: Block): number {
		return a.x - b.x;
	}

	compareMinY(a: Block, b: Block): number {
		return a.y - b.y;
	}

	/* Operations */

	addBlock(block: Block) {
		if (!this.isBlockInTree(block)) this.insert(block);
	}

	removeBlock(block: Block) {
		if (this.isBlockInTree(block)) this.remove(block, (a, b) => a.id == b.id);
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
