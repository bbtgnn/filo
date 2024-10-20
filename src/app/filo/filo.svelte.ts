// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Block } from '@/block/block.svelte';
import { Link } from '@/link/link.svelte';
import { ConstraintSolver, SpaceSolver } from '@/solver';
import * as kiwi from '@lume/kiwi';
import type { Rectangle } from '@/types';
import { nanoid } from 'nanoid';
import { View } from '@/view/view.svelte';

//

export class Filo {
	id: string;

	view = new View();
	constraintsSolver = new ConstraintSolver();
	spaceSolver = new SpaceSolver();

	blocks = $state<Block[]>([]);
	links = $state<Link[]>([]);
	origin = $state<{ block: Block; constraints: kiwi.Constraint[] } | undefined>(undefined);

	//

	constructor(id = nanoid(7)) {
		this.id = id;
	}

	//

	addBlock(block: Block) {
		this.blocks.push(block);
		this.constraintsSolver.addBlock(block);
		this.spaceSolver.addBlock(block);
		if (this.blocks.length == 1) this.setBlockOrigin(block);
	}

	removeBlock(blockId: string) {
		const block = this.blocks.find((b) => b.id == blockId);
		if (!block) return;
		this.blocks.splice(this.blocks.indexOf(block), 1);
		this.constraintsSolver.removeBlock(block);
		this.spaceSolver.removeBlock(block);
		if (this.blocks.length == 0) this.removeBlockOrigin();
	}

	addLink(link: Link) {
		this.links.push(link);
		this.constraintsSolver.addLink(link);
	}

	removeLink(linkId: string) {
		const link = this.links.find((l) => l.id == linkId);
		if (!link) return;
		this.links.splice(this.links.indexOf(link), 1);
		this.constraintsSolver.removeLink(link);
	}

	updateBlockSize(block: Block, size: Rectangle) {
		this.constraintsSolver.updateBlockSize(block, size);
	}

	replaceBlock(oldBlock: Block, newBlock: Block) {
		const linksToRemove = this.links.filter((link) => link.in == oldBlock || link.out == oldBlock);
		const newLinks = linksToRemove.map((oldLink) => {
			if (oldLink.in == oldBlock) {
				return new Link(newBlock, oldLink.out, oldLink.dimension, oldLink.sign);
			} else {
				return new Link(oldLink.in, newBlock, oldLink.dimension, oldLink.sign);
			}
		});

		for (const link of linksToRemove) this.removeLink(link.id);
		for (const link of newLinks) this.addLink(link);

		this.removeBlock(oldBlock.id);
		this.addBlock(newBlock);
		this.constraintsSolver.updateVariables();
		if (oldBlock == this.origin?.block) this.setBlockOrigin(newBlock);

		this.spaceSolver.updateBlock(newBlock);
	}

	setBlockOrigin(block: Block) {
		this.origin?.constraints.forEach((c) => this.constraintsSolver.removeConstraint(c));
		this.origin = {
			block,
			constraints: [
				new kiwi.Constraint(block.variables.x, kiwi.Operator.Eq, 0, kiwi.Strength.strong),
				new kiwi.Constraint(block.variables.y, kiwi.Operator.Eq, 0, kiwi.Strength.strong)
			]
		};
		this.origin.constraints.forEach((c) => this.constraintsSolver.addConstraint(c));
		this.constraintsSolver.updateVariables();
		this.blocks.forEach((b) => this.spaceSolver.updateBlock(b));
	}

	removeBlockOrigin() {
		this.origin?.constraints.forEach((c) => this.constraintsSolver.removeConstraint(c));
		this.origin = undefined;
	}
}
