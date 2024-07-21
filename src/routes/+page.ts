import { createBlock, createLink, getBlocks, getLinks } from '$lib/db/queries.js';

export const load = async ({ parent }) => {
	const { db } = await parent();

	await createBlock('A', { text: 'ciao' }, db);
	await createBlock('B', { text: 'ciao' }, db);
	await createBlock('C', { text: 'ciao' }, db);
	await createBlock('D', { text: 'ciao' }, db);
	await createBlock('E', { text: 'ciao' }, db);
	await createBlock('F', { text: 'ciao' }, db);

	await createLink({ in: 'A', out: 'B', dimension: 'j', sign: 1 }, db);
	await createLink({ in: 'B', out: 'C', dimension: 'j', sign: 1 }, db);

	await createLink({ in: 'A', out: 'D', dimension: 'i', sign: 1 }, db);

	await createLink({ in: 'D', out: 'E', dimension: 'j', sign: 1 }, db);
	await createLink({ in: 'B', out: 'E', dimension: 'i', sign: 1 }, db);

	await createLink({ in: 'E', out: 'F', dimension: 'j', sign: 1 }, db);
	await createLink({ in: 'C', out: 'F', dimension: 'i', sign: 1 }, db);

	return { blocks: await getBlocks(db), links: await getLinks(db) };
};
