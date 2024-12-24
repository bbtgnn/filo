// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// import { RecordId } from 'surrealdb';
import * as kiwi from '@lume/kiwi';
import { type Dimension } from '@/types';
import { config } from '@/config';
import type { Block } from '@/block/block.svelte';
import { getPerpendicularDimension } from '@/utils';

//

export type Sign = -1 | 1;

//

export class Link {
	id: string;
	in: Block;
	out: Block[];
	dimension: Dimension;
	sign: Sign;
	constraints: kiwi.Constraint[];

	variables = {
		length: new kiwi.Variable()
	};

	constructor(blockIn: Block, blockOut: Block[], dimension: Dimension, sign: Sign) {
		this.in = blockIn;
		this.out = blockOut;
		this.dimension = dimension;
		this.sign = sign;
		this.id = `${blockIn.id}->[${blockOut.map((b) => b.id).join(',')}]`;

		this.variables.length.setValue(config.viewport.defaultGap);

		this.constraints = this.getConstraints();
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
	// 		out: this.out.map(r => r.recordId).join(",").toString(),
	// 		sign: this.sign,
	// 		dimension: this.dimension
	// 	};
	// }

	/* Business logic */

	getConstraints() {
		/* */

		const positionConstraints: kiwi.Constraint[] = this.out.map((outBlock) => {
			const dimension = this.dimension;

			const distance = this.in.exp.half[dimension]
				.plus(this.variables.length)
				.plus(outBlock.exp.half[dimension]);

			console.log(this.in.exp.size[dimension].value());
			console.log(distance.value());

			return new kiwi.Constraint(
				this.in.exp.center[dimension].plus(distance.multiply(this.sign)),
				kiwi.Operator.Eq,
				outBlock.exp.center[dimension]
			);
		});

		/* */

		const orderConstraints: kiwi.Constraint[] = [];

		if (this.out.length > 1) {
			const dimension = getPerpendicularDimension(this.dimension);

			for (let i = 0; i < this.out.length - 1; i++) {
				const currentBlock = this.out[i];
				const nextBlock = this.out[i + 1];

				const distance = currentBlock.exp.half[dimension]
					.plus(config.block.padding * 2)
					.plus(nextBlock.exp.half[dimension]);

				orderConstraints.push(
					new kiwi.Constraint(
						currentBlock.exp.center[dimension].plus(distance),
						kiwi.Operator.Eq,
						nextBlock.exp.center[dimension]
					)
				);
			}
		}

		/* */

		let alignConstraint: kiwi.Constraint;

		if (this.out.length == 1) {
			const dimension = getPerpendicularDimension(this.dimension);

			alignConstraint = new kiwi.Constraint(
				this.in.exp.center[dimension],
				kiwi.Operator.Eq,
				this.out[0].exp.center[dimension]
			);
		} else {
			const dimension = getPerpendicularDimension(this.dimension);

			const firstBlock = this.out[0];
			const lastBlock = this.out[this.out.length - 1];

			const totalWidth = lastBlock.variables[dimension]
				.plus(lastBlock.exp.size[dimension])
				.minus(firstBlock.variables[dimension]);

			alignConstraint = new kiwi.Constraint(
				firstBlock.variables[dimension].plus(totalWidth.divide(2)),
				kiwi.Operator.Eq,
				this.in.exp.center[dimension]
			);
		}

		return [...positionConstraints, ...orderConstraints, alignConstraint];
	}
}

export type SerializedLink = {
	in: string;
	out: string;
	dimension: Dimension;
	sign: Sign;
};
