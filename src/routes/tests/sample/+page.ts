import textSample from './text-sample.md?raw';
import { Block } from '$lib/db/schema';
import { Solver } from '$lib/constraints/solver';

export const load = async () => {
	const block = Block.new({ id: '0', text: textSample });
	Solver.suggestBlockCoordinates(block, 0, 0);
	Solver.instance.updateVariables();
	return { blocks: [block] };
};
