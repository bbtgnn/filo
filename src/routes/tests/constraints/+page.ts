import { Block, Link } from '$lib/db/schema.js';

export const load = async () => {
	const blocks: Block[] = [
		new Block('0', 'ciao'),
		new Block('1', 'ciao'),
		new Block('2', 'ciao'),
		new Block('3', 'ciao'),
		new Block('4', 'ciao'),
		new Block('5', 'ciao'),
		new Block('6', 'ciao')
	];

	const links: Link[] = [
		new Link(blocks[0], blocks[1], 'x', 1),
		new Link(blocks[0], blocks[2], 'y', 1),
		new Link(blocks[2], blocks[3], 'x', 1),
		new Link(blocks[3], blocks[4], 'x', 1),
		new Link(blocks[1], blocks[4], 'y', 1),
		new Link(blocks[0], blocks[5], 'x', -1),
		new Link(blocks[0], blocks[6], 'y', -1)
	];

	return {
		blocks,
		links
	};
};
