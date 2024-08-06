import type { RecordId } from 'surrealdb.js';

export type Entry<T> = T & { id: RecordId };
