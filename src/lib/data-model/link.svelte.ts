import { uuidv7 } from 'surrealdb.js';
import * as kiwi from '@lume/kiwi';
import { getPerpendicularDimension, type Dimension } from '$lib/constraints';
import { config } from '$lib/config.js';
import type { Block } from './block.svelte';

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

	static get dbName() {
		return 'link' as const;
	}

	constructor(blockIn: Block, blockOut: Block, dimension: Dimension, sign: Sign) {
		this.in = blockIn;
		this.out = blockOut;
		this.dimension = dimension;
		this.sign = sign;
		this.constraints = this.getConstraints();
		this.id = uuidv7();
	}

	getConstraints() {
		const perpendicularDimension = getPerpendicularDimension(this.dimension);
		const mainBlock: 'in' | 'out' = this.sign == 1 ? 'in' : 'out';
		const secondaryBlock: 'in' | 'out' = this.sign == 1 ? 'out' : 'in';
		return {
			main: new kiwi.Constraint(
				this[mainBlock].variables[this.dimension]
					.plus(this[mainBlock].size[this.dimension])
					.plus(config.viewport.defaultGap),
				kiwi.Operator.Le,
				this[secondaryBlock].variables[this.dimension],
				kiwi.Strength.required
			),
			secondary: new kiwi.Constraint(
				this[mainBlock].variables[perpendicularDimension],
				kiwi.Operator.Eq,
				this[secondaryBlock].variables[perpendicularDimension],
				kiwi.Strength.weak
			)
		};
	}
}
