import { initDb } from '$lib/db';

export const ssr = false;
export const prerender = true;

export const load = async () => {
	return {
		db: await initDb()
	};
};
