import type Surreal from 'surrealdb.js';
import { Block, Link } from './schema';
import { RecordId } from 'surrealdb.js';

const BLOCK = Block.identifier;
const LINK = Link.identifier;

export async function createBlock(blockId: string, blockData: typeof Block.Type, db: Surreal) {
	const block = new Block(blockData);
	// @ts-expect-error To solve
	await db.create(new RecordId(BLOCK, blockId), block);
}

export async function getBlocks(db: Surreal) {
	return db.select(BLOCK);
}

export async function getLinks(db: Surreal) {
	return db.select(LINK);
}

export async function createLink(linkData: typeof Link.Type, db: Surreal) {
	const { i, j } = linkData;
	const inId = `${BLOCK}:${linkData.in}`;
	const outId = `${BLOCK}:${linkData.out}`;
	const query = `RELATE ${inId}->${LINK}->${outId} SET i = ${i}, j = ${j};`;
	await db.query(query);
}
