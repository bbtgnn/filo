import type { Block, BlockWithCoords, Link, LinkWithBlocks } from '$lib/db/schema';
import * as kiwi from '@lume/kiwi';
import { Array as A, Record as R, pipe, Tuple, Option as O, Order } from 'effect';
import { Solver } from './solver';

export function graphDataToConstraints(blocks: Block[], links: Link[]): Context {
	const blocksWithCoordinates: Record<string, BlockWithCoords> = pipe(
		blocks,
		A.map((block) => Tuple.make(block.id.toString(), block)),
		R.fromEntries,
		R.map((block) => ({
			...block,
			coordinates: {
				x: new kiwi.Variable(),
				y: new kiwi.Variable()
			}
		}))
	);

	const linksWithBlocks: LinkWithBlocks[] = pipe(
		links,
		A.map((link) => ({
			...link,
			blockIn: blocksWithCoordinates[link.in.toString()],
			blockOut: blocksWithCoordinates[link.out.toString()]
		}))
	);

	const constraints = pipe(
		linksWithBlocks,
		A.flatMap((linkWithBlocks) => [
			pipe(
				linkWithBlocks.dimension.id.toString() as Dimension,
				(dimension) =>
					new kiwi.Constraint(
						linkWithBlocks.blockIn.coordinates[dimension].plus(1 * linkWithBlocks.sign),
						linkWithBlocks.sign == 1 ? kiwi.Operator.Le : kiwi.Operator.Ge, // TODO - test
						linkWithBlocks.blockOut.coordinates[dimension]
					)
			),
			pipe(
				getPerpendicularDimension(linkWithBlocks.dimension.id.toString()),
				(dimension) =>
					new kiwi.Constraint(
						linkWithBlocks.blockIn.coordinates[dimension],
						kiwi.Operator.Eq,
						linkWithBlocks.blockOut.coordinates[dimension],
						kiwi.Strength.weak
					)
			)
		])
	);
	constraints.forEach((c) => Solver.instance.addConstraint(c));
	Solver.instance.updateVariables();

	setMinBlockByDimension(R.values(blocksWithCoordinates), 'x');
	setMinBlockByDimension(R.values(blocksWithCoordinates), 'y');
	Solver.instance.updateVariables();

	return {
		blocks: Object.values(blocksWithCoordinates),
		links: linksWithBlocks
	};
}

type Dimension = 'x' | 'y';

// TODO - this should return all the dimensions that are not
function getPerpendicularDimension(dimensionId: string): Dimension {
	return dimensionId == 'x' ? 'y' : 'x';
}

function setMinBlockByDimension(blocksWithCoordinates: BlockWithCoords[], dimension: Dimension) {
	pipe(
		blocksWithCoordinates,
		(blocks) =>
			blocks.sort((a, b) => a.coordinates[dimension].value() - b.coordinates[dimension].value()),
		A.head,
		O.map((block) => {
			Solver.instance.addEditVariable(block.coordinates[dimension], kiwi.Strength.strong);
			Solver.instance.suggestValue(block.coordinates[dimension], 0);
		})
	);
}

// function linkToConstraint

type Context = {
	blocks: BlockWithCoords[];
	links: LinkWithBlocks[];
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
	blockA: BlockWithCoords;
	blockB: BlockWithCoords;
};

type BlockLinkConflict = {
	type: 'block-link';
	block: BlockWithCoords;
	link: LinkWithBlocks;
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
