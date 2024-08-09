import { initDb } from '$lib/db';

export const ssr = false;
export const prerender = false;

export const load = async () => {
	return {
		db: await initDb()
	};
};
