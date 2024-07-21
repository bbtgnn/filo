import type Surreal from 'surrealdb.js';
import { DbBlock, DbLink } from './schema';
import { RecordId } from 'surrealdb.js';

const BLOCK = DbBlock.identifier;
const LINK = DbLink.identifier;

export async function createBlock(
	blockId: string,
	blockData: Partial<typeof DbBlock.Type>,
	db: Surreal
) {
	await db.create(new RecordId(BLOCK, blockId), blockData);
}

export async function getBlocks(db: Surreal) {
	return db.select(BLOCK) as unknown as DbBlock[];
}

export async function getLinks(db: Surreal) {
	return db.select(LINK) as unknown as DbLink[];
}

export async function createLink(linkData: Partial<typeof DbLink.Type>, db: Surreal) {
	const { dimension, sign } = linkData;
	const inId = `${BLOCK}:${linkData.in}`;
	const outId = `${BLOCK}:${linkData.out}`;
	const query = `RELATE ${inId}->${LINK}->${outId} SET dimension = ${dimension}, sign = ${sign};`;
	await db.query(query);
}
