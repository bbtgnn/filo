// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Block } from '@/block/block.svelte';
import { Link } from '@/link/link.svelte';
import { ConstraintSolver, SpaceSolver } from '@/solver';
import * as kiwi from '@lume/kiwi';
import type { Dimension, Direction, Rectangle } from '@/types';
import { nanoid } from 'nanoid';
import { View } from '@/view/view.svelte';
import { Option } from 'effect';
import _ from 'lodash';
import { dimensionToSize, getPerpendicularDimension, UnexpectedError } from '@/utils';
import { config } from '@/config';

//

export class Filo {
	id: string;

	view = new View();
	constraintsSolver = new ConstraintSolver();
	spaceSolver = new SpaceSolver();

	blocks = $state<Block[]>([]);
	links = $state<Link[]>([]);

	orderConstraints = $state<OrderConstraint[]>([]);
	alignConstraints = $state<AlignConstraint[]>([]);

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
		const linksToRemove = this.links.filter(
			(link) => link.in.block == oldBlock || link.out.block == oldBlock
		);
		const newLinks = linksToRemove.map((oldLink) => {
			if (oldLink.in.block == oldBlock) {
				return new Link({ ...oldLink.in, block: newBlock }, oldLink.out);
			} else {
				return new Link(oldLink.in, { ...oldLink.out, block: newBlock });
			}
		});
		for (const link of linksToRemove) this.removeLink(link.id);
		for (const link of newLinks) this.addLink(link);

		//

		const constraintsToRemove = this.orderConstraints.filter(
			(c) => c.in.id == oldBlock.id || c.out.id == newBlock.id
		);
		constraintsToRemove.forEach((oldConstraint) => {
			if (oldConstraint.in == oldBlock) {
				this.addOrderConstraint(newBlock, oldConstraint.out, oldConstraint.dimension);
			} else {
				this.addOrderConstraint(oldConstraint.in, newBlock, oldConstraint.dimension);
			}
		});

		for (const c of constraintsToRemove) this.removeOrderConstraint(c.in, c.out);

		//

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

	getBlockLinksBySide(block: Block, side: Direction): Link[] {
		return this.links.filter(
			(l) =>
				(_.isEqual(l.in.side, side) && l.in.block.id == block.id) ||
				(_.isEqual(l.out.side, side) && l.out.block.id == block.id)
		);
	}

	getBlocksOnSide(block: Block, side: Direction): Block[] {
		return this.getBlockLinksBySide(block, side)
			.map((l) => [l.in.block, l.out.block])
			.flat()
			.filter((b) => b.id != block.id);
	}

	getLinkByBlocks(blockIn: Block, blockOut: Block): Option.Option<Link> {
		return Option.fromNullable(
			this.links.find((l) => l.in.block.id === blockIn.id && l.out.block.id === blockOut.id)
		);
	}

	//

	addOrderConstraint(blockIn: Block, blockOut: Block, dimension: Dimension) {
		const constraint = new OrderConstraint(blockIn, blockOut, dimension);
		this.orderConstraints.push(constraint);
		this.constraintsSolver.addConstraint(constraint.self);
	}

	removeOrderConstraint(blockIn: Block, blockOut: Block) {
		const constraint = this.orderConstraints.find(
			(c) => c.in.id === blockIn.id && c.out.id === blockOut.id
		);
		if (constraint) this.constraintsSolver.removeConstraint(constraint.self);
	}
}

//

export class OrderConstraint {
	in: Block;
	out: Block;
	dimension: Dimension;
	self: kiwi.Constraint;

	constructor(blockIn: Block, blockOut: Block, dimension: Dimension) {
		this.in = blockIn;
		this.out = blockOut;
		this.dimension = dimension;
		this.self = new kiwi.Constraint(
			this.in.variables[dimension]
				.plus(this.in.variables[dimensionToSize(dimension)])
				.plus(config.viewport.defaultGap / 2), // TODO - Improve
			kiwi.Operator.Le,
			this.out.variables[dimension]
		);
	}
}

//

type AlignSide = 'origin' | 'opposite' | 'center';

type AlignAnchor = Block | AlignSide;

export class AlignConstraint {
	self: kiwi.Constraint;

	// TODO - ENSURE THAT ALL BLOCKS ARE ALL ON THE SAME SIDE OF BLOCKIN (maybe)
	// TODO - IS IT POSSIBLE TO DERIVE DIMENSION FROM BLOCKSOUT (maybe)
	constructor(
		public readonly blockIn: Block,
		public readonly blocksOut: Block[],
		public readonly dimension: Dimension,
		public readonly anchor: AlignAnchor
	) {
		const STR = kiwi.Strength.strong;
		const mainDimension = getPerpendicularDimension(dimension);

		if (this.anchor === 'center') {
			// TODO - Find a better implementation (this works only with fixed width blocks)
			if (isEven(this.blocksOut.length)) {
				const target = this.blocksOut[this.blocksOut.length / 2 + 1];
				this.self = new kiwi.Constraint(
					this.blockIn.variables[mainDimension],
					kiwi.Operator.Eq,
					target.variables[mainDimension],
					STR
				);
			} else {
				// TODO - Find a better implementation (this works only with fixed width blocks)
				const t1 = this.blocksOut[this.blocksOut.length / 2 - 1];
				const t2 = this.blocksOut[this.blocksOut.length / 2];
				this.self = new kiwi.Constraint(
					this.blockIn.exp.center[mainDimension],
					kiwi.Operator.Eq,
					t1.exp.center[mainDimension].plus(t2.exp.center[mainDimension]).divide(2)
				);
			}
		} else {
			let target: Block | undefined = undefined;
			if (this.anchor instanceof Block) {
				target = this.anchor;
			} else if (this.anchor == 'origin') {
				target = this.blocksOut.at(0)!;
			} else if (this.anchor === 'opposite') {
				target = this.blocksOut.at(-1);
			}

			if (!target) throw new UnexpectedError();

			this.self = new kiwi.Constraint(
				this.blockIn.variables[mainDimension],
				kiwi.Operator.Eq,
				target.variables[mainDimension],
				STR
			);
		}
	}
}

function isEven(n: number): boolean {
	return n % 2 === 1;
}

// function isOdd(n: number): boolean {
// 	return n % 2 === 0;
// }
