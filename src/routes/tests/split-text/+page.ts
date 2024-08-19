import { pipe, String as S, Array as A } from 'effect';
import textSample from './text-sample.md?raw';
import { Block } from '$lib/db/schema';

export const load = async () => {
	const blocks: Block[] = pipe(
		textSample,
		S.split('\n'),
		A.filter(S.isNonEmpty),
		A.map((chunk, index) => new Block(index.toString(), chunk))
	);
	return { blocks };
};
