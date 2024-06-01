type TokenState = 'default' | 'selected';

export class Token {
	constructor(
		public text: string,
		public index: number,
		public state: TokenState = 'default'
	) {}
}

export class Line {
	constructor(
		public tokens: Token[],
		public index: number
	) {}
}
