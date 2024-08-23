import { RecordId } from 'surrealdb.js';
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
	id: RecordId;
	in: Block;
	out: Block;
	dimension: Dimension;
	sign: Sign;
	constraints: {
		main: kiwi.Constraint;
		secondary: kiwi.Constraint;
	};

	static get dbName() {
		return 'link' as const;
	}

	constructor(blockIn: Block, blockOut: Block, dimension: Dimension, sign: Sign) {
		this.in = blockIn;
		this.out = blockOut;
		this.dimension = dimension;
		this.sign = sign;
		this.constraints = this.getConstraints();
		this.id = new RecordId(Link.dbName, nanoid(5));
	}

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
