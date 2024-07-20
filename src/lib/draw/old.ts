// place files you want to import through the `$lib` alias in this folder.

const DEFAULT_BLOCK_WIDTH = 200;

export type Point = {
	x: number;
	y: number;
};

export type LinkPosition = 'left' | 'right' | 'bottom' | 'top';

type Link = {
	position: LinkPosition;
	anchor: Block;
	tier: number;
};

export type BlockId = string;

export class Block {
	position: Point;
	abstractPosition: Point;
	content: string;
	links: Link[];
	id: BlockId;
	width: number;
	neighbors: Record<LinkPosition, BlockId[]>;

	constructor(input: Partial<Block>) {
		this.position = input.position ?? { x: 0, y: 0 };
		this.abstractPosition = input.abstractPosition ?? { x: 0, y: 0 };
		this.content = input.content ?? '';
		this.links = input.links ?? [];
		this.id = input.id ?? '';
		this.width = input.width ?? DEFAULT_BLOCK_WIDTH;
		this.neighbors = input.neighbors ?? {
			left: [],
			bottom: [],
			top: [],
			right: []
		};
	}

	get topLeft(): Point {
		return this.position;
	}

	get bottomRight(): Point {
		return {
			x: this.position.x + this.width,
			y: this.position.y + this.height
		};
	}

	get divElement(): HTMLDivElement {
		// @ts-expect-error HTML element may not be present
		return document.getElementById(this.id);
	}

	get height(): number {
		return this.divElement.getBoundingClientRect().height;
	}
}

type Instruction = {
	block: BlockId;
	position: LinkPosition;
	anchor: BlockId;
};

export type Inputs = Array<Instruction>;
