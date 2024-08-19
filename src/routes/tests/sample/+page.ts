import textSample from './text-sample.md?raw';
import { Block } from '$lib/db/schema';
import { Solver } from '$lib/constraints/solver';

export const load = async () => {
	const block = new Block('0', textSample);
	Solver.suggestBlockCoordinates(block, 0, 0);
	Solver.instance.updateVariables();
	return { blocks: [block] };
};
