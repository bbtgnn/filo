// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Surreal } from 'surrealdb';
import { surrealdbWasmEngines } from '@surrealdb/wasm';

//

export async function initDb(
	uri: string | URL,
	namespace: string,
	database: string,
	schema: string | undefined = undefined
): Promise<Surreal> {
	const db = new Surreal({
		engines: surrealdbWasmEngines()
	});
	try {
		await db.connect(uri);
		await db.use({ namespace, database });
		if (schema)
			try {
				await db.query(schema);
			} catch {
				throw new Error('Error in schema load');
			}
		return db;
	} catch (err) {
		console.error('Failed to connect to SurrealDB:', err);
		throw err;
	}
}
