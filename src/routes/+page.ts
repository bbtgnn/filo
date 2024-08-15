import {
	createBlock,
	getBlocks,
	createDimension,
	getDimensions,
	createLink,
	getLinks
} from '$lib/db/queries.js';

export const load = async ({ parent }) => {
	const { db } = await parent();

	await createDimension(db, 'x', { vector: '100' });
	await createDimension(db, 'y', { vector: '010' });

	await createBlock(db, 'A', { text: 'ciao' });
	await createBlock(db, 'B', { text: 'ciao' });
	await createBlock(db, 'C', { text: 'ciao' });
	await createBlock(db, 'D', { text: 'ciao' });
	await createBlock(db, 'E', { text: 'ciao' });
	await createBlock(db, 'F', { text: 'ciao' });
	await createBlock(db, 'G', { text: 'ciao' });
	await createBlock(db, 'Du', { text: 'ciao' });

	await createLink(db, { in: 'A', out: 'B', dimension: 'x', sign: 1 });
	await createLink(db, { in: 'A', out: 'F', dimension: 'x', sign: -1 });
	await createLink(db, { in: 'A', out: 'C', dimension: 'y', sign: 1 });
	await createLink(db, { in: 'C', out: 'D', dimension: 'x', sign: 1 });
	await createLink(db, { in: 'D', out: 'E', dimension: 'x', sign: 1 });
	await createLink(db, { in: 'B', out: 'E', dimension: 'y', sign: 1 });
	await createLink(db, { in: 'A', out: 'G', dimension: 'y', sign: -1 });
	await createLink(db, { in: 'E', out: 'Du', dimension: 'y', sign: -1 });

	return {
		blocks: await getBlocks(db),
		dimensions: await getDimensions(db),
		links: await getLinks(db)
	};
};
