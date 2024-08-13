import type { Block, BlockWithCoords, Link } from '$lib/db/schema';
import * as kiwi from '@lume/kiwi';
import { Array as A, Record as R, pipe, Tuple, Option as O } from 'effect';
import { Solver } from './solver';

export function graphDataToConstraints(blocks: Block[], links: Link[]) {
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

	const linksWithBlocks = pipe(
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
						linkWithBlocks.blockOut.coordinates[dimension]
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
		Solver,
		blocksWithCoordinates,
		linksWithBlocks
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
