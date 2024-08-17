import { Block, Link } from '$lib/db/schema.js';

export const load = async () => {
	const blocks: Block[] = [
		Block.new({ id: '0', text: 'ciao' }),
		Block.new({ id: '1', text: 'ciao' }),
		Block.new({ id: '2', text: 'ciao' }),
		Block.new({ id: '3', text: 'ciao' }),
		Block.new({ id: '4', text: 'ciao' }),
		Block.new({ id: '5', text: 'ciao' }),
		Block.new({ id: '6', text: 'ciao' })
	];

	const links: Link[] = [
		Link.new({ in: '0', out: '1', dimension: 'x', sign: 1 }),
		Link.new({ in: '0', out: '2', dimension: 'y', sign: 1 }),
		Link.new({ in: '2', out: '3', dimension: 'x', sign: 1 }),
		Link.new({ in: '3', out: '4', dimension: 'x', sign: 1 }),
		Link.new({ in: '1', out: '4', dimension: 'y', sign: 1 }),
		Link.new({ in: '0', out: '5', dimension: 'x', sign: -1 }),
		Link.new({ in: '0', out: '6', dimension: 'y', sign: -1 })
	];

	return {
		blocks,
		links
	};
};
