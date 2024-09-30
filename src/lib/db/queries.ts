// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// import type Surreal from 'surrealdb.js';
// import type { Block, BlockIn, Dimension, DimensionIn, Link, LinkIn } from './schema';
// import { RecordId } from 'surrealdb.js';

// //

// const BlockId = 'block';

// export function createBlock(db: Surreal, id: string, data: BlockIn) {
// 	return db.create<BlockIn>(new RecordId(BlockId, id), data);
// }

// export function getBlocks(db: Surreal) {
// 	return db.select<Block>(BlockId);
// }

// //

// const DimensionId = 'dimension';

// export function createDimension(db: Surreal, id: string, data: DimensionIn) {
// 	return db.create<DimensionIn>(new RecordId(DimensionId, id), data);
// }

// export function getDimensions(db: Surreal) {
// 	return db.select<Dimension>(DimensionId);
// }

// //

// const LinkId = 'link';

// export async function createLink(db: Surreal, data: LinkIn) {
// 	const { dimension, sign } = data;
// 	const inId = `${BlockId}:${data.in}`;
// 	const outId = `${BlockId}:${data.out}`;
// 	const dimensionId = `${DimensionId}:${dimension}`;
// 	const query = `RELATE ${inId}->${LinkId}->${outId} SET dimension = ${dimensionId}, sign = ${sign};`;
// 	try {
// 		await db.query(query);
// 	} catch (e) {
// 		// @ts-expect-error e is unknown
// 		console.log(e.message);
// 	}
// }

// export function getLinks(db: Surreal) {
// 	return db.select<Link>(LinkId);
// }
