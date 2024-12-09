import type { Block } from '@/block/block.svelte';
import type { Dimension, Side } from '@/types';
// import { getPerpendicularDimension } from '@/utils';
import * as kiwi from '@lume/kiwi';

//

export class Link {
	constraints: Array<kiwi.Constraint> = [];

	constructor(
		public readonly blocks: {
			in: Block;
			out: Block; // TODO - Handle more blocks at once
		},
		public readonly dimension: Dimension,
		public readonly side: Side // TODO - Handle cases where out side is different
	) {
		this.constraints = [];
	}

	private calcConstraints(): kiwi.Constraint[] {
		return [];
		// const perpendicularDimension = getPerpendicularDimension(this.dimension);
		// const mainAnchor = this.sign == 1 ? this.in : this.out;
		// const mainBlock = mainAnchor.block;
		// const secondaryAnchor = this.sign == 1 ? this.out : this.in;
		// const secondaryBlock = secondaryAnchor.block;
		// const involvedSize = dimensionToSize(this.dimension);
		// return {
		// 	main: new kiwi.Constraint(
		// 		mainBlock.variables[this.dimension]
		// 			.plus(mainBlock.variables[involvedSize])
		// 			.plus(config.viewport.defaultGap),
		// 		kiwi.Operator.Le,
		// 		secondaryBlock.variables[this.dimension],
		// 		kiwi.Strength.required
		// 	),
		// 	secondary: new kiwi.Constraint(
		// 		mainBlock.variables[perpendicularDimension],
		// 		kiwi.Operator.Eq,
		// 		secondaryBlock.variables[perpendicularDimension],
		// 		kiwi.Strength.weak
		// 	)
		// };
	}
}
