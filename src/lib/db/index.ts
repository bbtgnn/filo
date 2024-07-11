import { Surreal } from 'surrealdb.js';
import { PUBLIC_DB_URI, PUBLIC_DB_NAME, PUBLIC_DB_NAMESPACE } from '$env/static/public';
import DB_SCHEMA from './schema.surql?raw';

let db: Surreal | undefined = undefined;

const DEBUG = true;
const MEM_URI = 'mem://';

export async function initDb(): Promise<Surreal> {
	if (db) return db;
	const wasm = await import('surrealdb.wasm');
	db = new Surreal({
		// @ts-expect-error Improper library typing, but it works
		engines: wasm.surrealdbWasmEngines()
	});
	try {
		await db.connect(DEBUG ? MEM_URI : PUBLIC_DB_URI);
		await db.use({ namespace: PUBLIC_DB_NAMESPACE, database: PUBLIC_DB_NAME });
		await loadSchema(db, DB_SCHEMA);
		return db;
	} catch (err) {
		console.error('Failed to connect to SurrealDB:', err);
		throw err;
	}
}

export async function closeDb(): Promise<void> {
	if (!db) return;
	await db.close();
	db = undefined;
}

export function getDb(): Surreal {
	if (!db) throw new Error('Database not loaded');
	return db;
}

async function loadSchema(db: Surreal, schemaQuery: string) {
	try {
		await db.query(schemaQuery);
	} catch {
		throw new Error('Error in schema load');
	}
}
