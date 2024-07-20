import type { Block, BlockId, Inputs, LinkPosition, Point } from './old';

//

export function preprocessLinks(blocks: Block[]) {
	if (blocks.length === 0) return;
	const processedBlocks: BlockId[] = [];

	blocks[0].abstractPosition = { x: 0, y: 0 };
	processedBlocks.push(blocks[0].id);

	preprocessBlock(blocks, blocks[0], processedBlocks);
}

function preprocessBlock(blocks: Block[], block: Block, processedBlocks: BlockId[] = []) {
	block.neighbors.top.forEach((blockId, index) =>
		preprocessBlockHelper(
			blocks,
			block,
			blockId,
			processedBlocks,
			{ x: 0, y: -1 },
			index,
			block.neighbors.top.length
		)
	);
	block.neighbors.left.forEach((blockId, index) =>
		preprocessBlockHelper(
			blocks,
			block,
			blockId,
			processedBlocks,
			{ x: -1, y: 0 },
			index,
			block.neighbors.left.length
		)
	);
	block.neighbors.right.forEach((blockId, index) =>
		preprocessBlockHelper(
			blocks,
			block,
			blockId,
			processedBlocks,
			{ x: 1, y: 0 },
			index,
			block.neighbors.right.length
		)
	);
	block.neighbors.bottom.forEach((blockId, index) =>
		preprocessBlockHelper(
			blocks,
			block,
			blockId,
			processedBlocks,
			{ x: 0, y: 1 },
			index,
			block.neighbors.bottom.length
		)
	);
}

function preprocessBlockHelper(
	blocks: Block[],
	anchorBlock: Block,
	targetBlockId: string,
	processedBlocks: BlockId[],
	coords: Point,
	index: number,
	amount: number
) {
	if (processedBlocks.includes(targetBlockId)) return;
	const targetBlock = findBlockById(blocks, targetBlockId);
	if (!targetBlock) return;
	const startPosition = Math.floor(amount / 2);
	const actualPosition = -startPosition + index;
	targetBlock.abstractPosition.x = anchorBlock.abstractPosition.x + coords.x;
	targetBlock.abstractPosition.y = anchorBlock.abstractPosition.y + coords.y;
	if (coords.x === 0) targetBlock.abstractPosition.x = actualPosition;
	if (coords.y === 0) targetBlock.abstractPosition.y = actualPosition;
	processedBlocks.push(targetBlock.id);
	preprocessBlock(blocks, targetBlock, processedBlocks);
}

//

export function sortLinks(blocks: Block[], inputs: Inputs) {
	for (const instruction of inputs) {
		const anchorBlock = findBlockById(blocks, instruction.anchor);
		const targetBlock = findBlockById(blocks, instruction.block);
		if (anchorBlock && targetBlock) {
			const position = instruction.position;
			if (!anchorBlock.neighbors[position].includes(targetBlock.id)) {
				anchorBlock.neighbors[position].push(targetBlock.id);
			}
			const opposite = getOppositePosition(position);
			if (!targetBlock.neighbors[opposite].includes(anchorBlock.id)) {
				targetBlock.neighbors[opposite].push(anchorBlock.id);
			}
		}
	}
}

function getOppositePosition(position: LinkPosition): LinkPosition {
	switch (position) {
		case 'left':
			return 'right';
		case 'right':
			return 'left';
		case 'bottom':
			return 'top';
		case 'top':
			return 'bottom';
	}
}

//

const DEFAULT_HORIZONTAL_SPACING = 100;
const DEFAULT_VERTICAL_SPACING = 100;

export function drawLinks(blocks: Block[], inputs: Inputs) {
	for (const instruction of inputs) {
		const anchorBlock = findBlockById(blocks, instruction.anchor);
		const targetBlock = findBlockById(blocks, instruction.block);
		if (anchorBlock && targetBlock) {
			if (instruction.position == 'right') {
				targetBlock.position = {
					x: anchorBlock.bottomRight.x + DEFAULT_HORIZONTAL_SPACING,
					y: anchorBlock.topLeft.y
				};
			} else if (instruction.position == 'left') {
				targetBlock.position = {
					x: anchorBlock.topLeft.x - DEFAULT_HORIZONTAL_SPACING - targetBlock.width,
					y: anchorBlock.topLeft.y
				};
			} else if (instruction.position == 'top') {
				targetBlock.position = {
					x: anchorBlock.topLeft.x,
					y: anchorBlock.topLeft.y - DEFAULT_VERTICAL_SPACING - targetBlock.height
				};
			} else if (instruction.position == 'bottom') {
				targetBlock.position = {
					x: anchorBlock.topLeft.x,
					y: anchorBlock.bottomRight.y + DEFAULT_VERTICAL_SPACING
				};
			}
		}
	}
}

function findBlockById(blocks: Block[], blockId: string) {
	return blocks.find((b) => b.id == blockId);
}
