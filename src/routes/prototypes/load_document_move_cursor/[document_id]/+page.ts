import { Line, Token } from '$lib';
import text_sample from './text_sample.md?raw';
import { pipe, Array as A, String as S } from 'effect';

export const load = async () => {
	return {
		text: pipe(
			text_sample,
			S.split(' '),
			A.map((text, index) => new Token(text, index))
		)
	};
};

function textToLines(text: string) {
	const lines = pipe(
		text,
		S.split('\n'),
		A.map(S.trim),
		A.map(S.split(' ')),
		A.map(A.map((text, index) => new Token(text, index)))
	);
}
