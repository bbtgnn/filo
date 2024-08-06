import type Surreal from 'surrealdb.js';
import { Dao } from './schema';
import { RecordId } from 'surrealdb.js';
import { pipe } from 'effect';
import type { Entry } from './types';

export function createBlock(db: Surreal, id: string, data: Dao['Block']['Encoded']) {
	return pipe(new Dao.Block(data), (data) =>
		db.create<Dao['Block']['Encoded']>(new RecordId(Dao.Block.identifier, id), data)
	);
}

export function getBlocks(db: Surreal) {
	return db.select<Entry<Dao['Block']['Encoded']>>(Dao.Block.identifier);
}

export function createDimension(db: Surreal, id: string, data: Dao['Dimension']['Encoded']) {
	return pipe(new Dao.Dimension(data), (data) =>
		db.create<Dao['Dimension']['Encoded']>(new RecordId(Dao.Dimension.identifier, id), data)
	);
}

export function getDimensions(db: Surreal) {
	return db.select<Entry<Dao['Dimension']['t']>>(Dao.Dimension.identifier);
}

export async function createLink(db: Surreal, data: Dao['Link']['Encoded']) {
	const { dimension, sign } = data;
	const inId = `${Dao.Block.identifier}:${data.in}`;
	const outId = `${Dao.Block.identifier}:${data.out}`;
	const dimensionId = `${Dao.Dimension.identifier}:${dimension}`;
	const query = `RELATE ${inId}->${Dao.Link.identifier}->${outId} SET dimension = ${dimensionId}, sign = ${sign};`;
	try {
		await db.query(query);
	} catch (e) {
		// @ts-expect-error e is unknown
		console.log(e.message);
	}
}

export function getLinks(db: Surreal) {
	return db.select<Entry<Dao['Link']['Encoded']>>(Dao.Link.identifier);
}
