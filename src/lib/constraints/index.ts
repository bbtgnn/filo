import type { Block, Link } from '$lib/db/schema';
import * as kiwi from '@lume/kiwi';
import { Array as A, pipe, Tuple, Option as O, Order } from 'effect';
import { Solver } from './solver';

export function graphDataToConstraints(blocks: Block[], links: Link[]) {
	const constraints = pipe(
		links,
		A.map((link) =>
			pipe(
				Tuple.make(
					A.findFirst(blocks, (b) => b.id.toString() == link.in.toString()),
					A.findFirst(blocks, (b) => b.id.toString() == link.out.toString())
				),
				O.all,
				O.map(([blockIn, blockOut]) => [
					pipe(
						link.dimension.id.toString() as Dimension,
						(dimension) =>
							new kiwi.Constraint(
								blockIn.coordinates[dimension].plus(1 * link.sign),
								link.sign == 1 ? kiwi.Operator.Le : kiwi.Operator.Ge, // TODO - test
								blockOut.coordinates[dimension]
							)
					),
					pipe(
						getPerpendicularDimension(link.dimension.id.toString()),
						(dimension) =>
							new kiwi.Constraint(
								blockIn.coordinates[dimension],
								kiwi.Operator.Eq,
								blockOut.coordinates[dimension],
								kiwi.Strength.weak
							)
					)
				])
			)
		),
		O.all,
		O.map(A.flatten),
		O.getOrThrow
	);
	constraints.forEach((c) => Solver.instance.addConstraint(c));
	Solver.instance.updateVariables();

	setMinBlockByDimension(blocks, 'x');
	setMinBlockByDimension(blocks, 'y');
	Solver.instance.updateVariables();
}

type Dimension = 'x' | 'y';

// TODO - this should return all the dimensions that are not
function getPerpendicularDimension(dimensionId: string): Dimension {
	return dimensionId == 'x' ? 'y' : 'x';
}

function setMinBlockByDimension(blocks: Block[], dimension: Dimension) {
	pipe(
		blocks,
		(blocks) =>
			blocks.sort((a, b) => a.coordinates[dimension].value() - b.coordinates[dimension].value()),
		A.head,
		O.map((block) => {
			Solver.instance.addEditVariable(block.coordinates[dimension], kiwi.Strength.weak);
			Solver.instance.suggestValue(block.coordinates[dimension], 0);
		})
	);
}

// function linkToConstraint

type Context = {
	blocks: Block[];
	links: Link[];
};

export function findConflicts(context: Context): Conflict[] {
	return findConflictingBlocks(context);
}

export function findConflictingBlocks({ blocks }: Context): BlockBlockConflict[] {
	return pipe(
		blocks,
		A.cartesian(blocks), // TODO - I think this can be optimized
		A.filter(([b1, b2]) => b1 != b2),
		A.filter(([b1, b2]) => {
			return (
				b1.coordinates.x.value() == b2.coordinates.x.value() &&
				b1.coordinates.y.value() == b2.coordinates.y.value()
			);
		}),
		A.map(A.sortWith((block) => block.id.toString(), Order.string)),
		A.dedupeWith(([b1, b2], [b3, b4]) => b1 == b3 && b2 == b4),
		A.map(([b1, b2]) => ({
			type: 'block-block',
			blockA: b1,
			blockB: b2
		}))
	);
}

type BlockBlockConflict = {
	type: 'block-block';
	blockA: Block;
	blockB: Block;
};

type BlockLinkConflict = {
	type: 'block-link';
	block: Block;
	link: Link;
};

export type Conflict = BlockBlockConflict | BlockLinkConflict;

//

export function solveConflicts(conflicts: Conflict[], mainAxis: Dimension) {
	// TODO - right now, we solve conflicts in the order provided by the array
	// Maybe, the order in which solve the conflicts is important
	// So there's shoule be some kind of way to sort conflicts, based on priorities / distance from start / "main axis"
	conflicts.forEach((conflict) => {
		if (conflict.type == 'block-block') {
			const constraint = BlockBlockConflictonflictToConstraint(conflict, mainAxis);
			try {
				Solver.instance.addConstraint(constraint);
				Solver.instance.updateVariables();
			} catch (e) {
				console.log(e);
			}
		}
		// TODO - update conflicts after each resolution
	});
}

// TODO - sort based on id
function BlockBlockConflictonflictToConstraint(conflict: BlockBlockConflict, mainAxis: Dimension) {
	// Questa è solo una delle euristiche
	return pipe(
		Tuple.make(conflict.blockA, conflict.blockB),
		A.sortWith((block) => block.id.toString(), Order.string),
		(blocks) => Tuple.make(A.get(blocks, 0), A.get(blocks, 1)),
		O.all,
		(x) => {
			console.log(x);
			return x;
		},
		O.map(
			([b1, b2]) =>
				new kiwi.Constraint(
					b1.coordinates[mainAxis].plus(1),
					kiwi.Operator.Le,
					b2.coordinates[mainAxis]
				)
		),
		O.getOrThrow
	);
}
