import { getBlocks, getLinks } from '$lib/db/queries.js';

export const load = async ({ parent }) => {
	const { db } = await parent();
	return { blocks: await getBlocks(db), links: await getLinks(db) };
};
