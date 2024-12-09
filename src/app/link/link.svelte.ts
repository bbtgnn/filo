// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// import { RecordId } from 'surrealdb';
import * as kiwi from '@lume/kiwi';
import { type Dimension, type Direction } from '@/types';
import { config } from '@/config';
import type { Block } from '@/block/block.svelte';
import { dimensionToSize, NotImplementedError } from '@/utils';

//

export type Sign = -1 | 1;

export type LinkAnchor = {
	block: Block;
	side: Direction;
	order: number;
};

//

export class Link {
	id: string;
	in: LinkAnchor;
	out: LinkAnchor;
	constraint: kiwi.Constraint;

	constructor(anchorIn: LinkAnchor, anchorOut: LinkAnchor) {
		this.in = anchorIn;
		this.out = anchorOut;
		this.constraint = this.getConstraint();
		this.id = `${anchorIn.block.id}->${anchorOut.block.id}`;
	}

	get dimension(): Dimension {
		if (this.in.side.dimension == this.out.side.dimension) return this.in.side.dimension;
		else throw new NotImplementedError();
	}

	get sign(): Sign {
		if (this.in.side.sign == -1 * this.out.side.sign) return this.in.side.sign;
		else throw new NotImplementedError();
	}

	/* DB */

	// static get dbName() {
	// 	return 'link' as const;
	// }

	// get recordId(): RecordId {
	// 	return new RecordId(Link.dbName, this.id);
	// }

	// serialize(): SerializedLink {
	// 	return {
	// 		in: this.in.recordId.toString(),
	// 		out: this.out.recordId.toString(),
	// 		sign: this.sign,
	// 		dimension: this.dimension
	// 	};
	// }

	/* Business logic */

	getConstraint() {
		const mainAnchor = this.sign == 1 ? this.in : this.out;
		const mainBlock = mainAnchor.block;

		const secondaryAnchor = this.sign == 1 ? this.out : this.in;
		const secondaryBlock = secondaryAnchor.block;

		const involvedSize = dimensionToSize(this.dimension);

		return new kiwi.Constraint(
			mainBlock.variables[this.dimension]
				.plus(mainBlock.variables[involvedSize])
				.plus(config.viewport.defaultGap),
			kiwi.Operator.Le,
			secondaryBlock.variables[this.dimension],
			kiwi.Strength.required
		);
	}
}

export type SerializedLink = {
	in: string;
	out: string;
	dimension: Dimension;
	sign: Sign;
};
