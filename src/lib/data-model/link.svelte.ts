import { RecordId } from 'surrealdb';
import * as kiwi from '@lume/kiwi';
import { type Dimension } from '$lib/data-model/types';
import { config } from '$lib/config.js';
import type { Block } from './block.svelte';
import { dimensionToSize, getPerpendicularDimension } from '$lib/utils';
import { nanoid } from 'nanoid';

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
		this.id = nanoid(5);
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
