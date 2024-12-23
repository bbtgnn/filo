// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { RecordId } from 'surrealdb';
import * as kiwi from '@lume/kiwi';
import { type Dimension } from '@/types';
import { config } from '@/config';
import type { Block } from '@/block/block.svelte';
import { dimensionToSize, getPerpendicularDimension } from '@/utils';

//

export type Sign = -1 | 1;

//

export class Link {
	id: string;
	in: Block;
	out: Block;
	dimension: Dimension;
	sign: Sign;
	constraints: {
		main: kiwi.Constraint;
		secondary: kiwi.Constraint;
	};

	constructor(blockIn: Block, blockOut: Block, dimension: Dimension, sign: Sign) {
		this.in = blockIn;
		this.out = blockOut;
		this.dimension = dimension;
		this.sign = sign;
		this.constraints = this.getConstraints();
		this.id = `${blockIn.id}->${blockOut.id}`;
	}

	/* DB */

	static get dbName() {
		return 'link' as const;
	}

	get recordId(): RecordId {
		return new RecordId(Link.dbName, this.id);
	}

	serialize(): SerializedLink {
		return {
			in: this.in.recordId.toString(),
			out: this.out.recordId.toString(),
			sign: this.sign,
			dimension: this.dimension
		};
	}

	/* Business logic */

	getConstraints() {
		const perpendicularDimension = getPerpendicularDimension(this.dimension);
		const mainBlock = this.sign == 1 ? this.in : this.out;
		const secondaryBlock = this.sign == 1 ? this.out : this.in;
		const involvedSize = dimensionToSize(this.dimension);

		return {
			main: new kiwi.Constraint(
				mainBlock.variables[this.dimension]
					.plus(mainBlock.variables[involvedSize])
					.plus(config.viewport.defaultGap),
				kiwi.Operator.Le,
				secondaryBlock.variables[this.dimension],
				kiwi.Strength.required
			),
			secondary: new kiwi.Constraint(
				mainBlock.variables[perpendicularDimension],
				kiwi.Operator.Eq,
				secondaryBlock.variables[perpendicularDimension],
				kiwi.Strength.weak
			)
		};
	}
}

export type SerializedLink = {
	in: string;
	out: string;
	dimension: Dimension;
	sign: Sign;
};
