import { pipe, String as S, Array as A } from 'effect';
import textSample from './text-sample.md?raw';
import type { TokenGroup } from './lib';

export const load = async () => {
	const tokens: TokenGroup[] = pipe(
		textSample,
		S.split('\n'),
		A.map(S.split(' ')),
		A.map((texts, index) => ({ tokens: texts.map((text) => ({ text, id: index.toString() })) }))
	);
	return { tokens, text: { text: textSample, id: '0' } };
};
