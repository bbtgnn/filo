// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Block } from '@/block/block.svelte';
import { Link } from '@/link/link.svelte';
import { ConstraintSolver, SpaceSolver } from '@/solver';
import * as kiwi from '@lume/kiwi';
import type { Dimension, Rectangle, Sign } from '@/types';
import { nanoid } from 'nanoid';
import { View } from '@/view/view.svelte';
import { getPerpendicularDimension, UnexpectedCaseError } from '@/utils';
import { Option } from 'effect';
import { config } from '@/config';

//

export class Filo {
	id: string;

	view = new View();
	constraintsSolver = new ConstraintSolver();
	spaceSolver = new SpaceSolver();

	blocks = $state<Block[]>([]);
	links = $state<Link[]>([]);
	groups = $state<Group[]>([]);
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
		const group = this.getGroupOnSide(link.in, link.dimension, link.sign);
		if (Option.isSome(group)) {
			this.addBlockToGroup(group.value, link.out);
		} else {
			const group = new Group(link.in, [link.out], link.dimension, signToSide(link.sign));
			this.addGroup(group);
		}
	}

	getGroupOnSide(block: Block, dimension: Dimension, sign: Sign): Option.Option<Group> {
		const groups = this.groups.filter(
			(g) => g.reference.id == block.id && g.side == signToSide(sign) && g.dimension == dimension
		);
		if (groups.length == 0) return Option.none();
		else if (groups.length > 1) throw new UnexpectedCaseError();
		else return Option.some(groups[0]);
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

	// Groups utility

	addGroup(group: Group) {
		this.groups.push(group);
		this.addConstraints(group.constraints);
		this.constraintsSolver.updateVariables();
	}

	addBlockToGroup(group: Group, block: Block) {}

	addConstraints(constraints: kiwi.Constraint[]) {
		for (const c of constraints) {
			this.constraintsSolver.addConstraint(c);
		}
	}
}

//

type Side = 'origin' | 'opposite';
type Alignment = 'center' | Side;

export class Group {
	orderConstraints: OrderConstraint[] = [];
	alignmentConstraint: kiwi.Constraint;

	constructor(
		public readonly reference: Block,
		public readonly blocks: Block[],
		public readonly dimension: Dimension,
		public readonly side: Side,
		public readonly alignment: Alignment = 'center'
	) {
		this.calculateConstraints();
	}

	calculateConstraints() {
		this.orderConstraints = [];
		for (let i = 0; i < this.blocks.length - 1; i++) {
			this.orderConstraints.push(
				new OrderConstraint(
					{ in: this.blocks[i], out: this.blocks[i + 1] },
					this.perpendicularDimension
				)
			);
		}
	}

	get constraints(): kiwi.Constraint[] {
		return this.orderConstraints.map((o) => o.self);
	}

	get perpendicularDimension(): Dimension {
		return getPerpendicularDimension(this.dimension);
	}

	calcAlignmentConstraint(): kiwi.Constraint {
		if (this.alignment == 'origin') {
			return new kiwi.Constraint(
				this.reference.variables[this.perpendicularDimension],
				kiwi.Operator.Eq,
				this.blocks[0].variables[this.perpendicularDimension]
			);
		} else if (this.alignment == 'opposite') {
			return new kiwi.Constraint(
				this.reference.variables[this.perpendicularDimension],
				kiwi.Operator.Eq,
				this.blocks.at(-1)!.variables[this.perpendicularDimension]
			);
		} else {
			return new kiwi.Constraint(this.blocksthis.blocks[0].variables[this.perpendicularDimension]);
		}
	}

	addBlock(block: Block): kiwi.Constraint[] {
		this.blocks.push(block);
		this.calculateConstraints();
		return this.constraints;
	}
}

function signToSide(sign: Sign): Side {
	if (sign === 1) return 'opposite';
	else return 'origin';
}

class OrderConstraint {
	self: kiwi.Constraint;

	constructor(
		public readonly blocks: {
			in: Block;
			out: Block;
		},
		public readonly dimension: Dimension
	) {
		this.self = new kiwi.Constraint(
			this.blocks.in.expressions.opposite[this.dimension].plus(config.viewport.defaultGap / 2),
			kiwi.Operator.Le,
			this.blocks.out.variables[dimension]
		);
	}
}
