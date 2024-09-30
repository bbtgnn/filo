// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { initDb } from '$lib/db';
import { PUBLIC_DB_URI, PUBLIC_DB_NAME, PUBLIC_DB_NAMESPACE } from '$env/static/public';
// import DB_SCHEMA from '$lib/db/schema.surql?raw';

const DEBUG = true;
const MEM_URI = 'mem://';

export const load = async () => {
	const db = await initDb(DEBUG ? MEM_URI : PUBLIC_DB_URI, PUBLIC_DB_NAMESPACE, PUBLIC_DB_NAME);
	return { db };
};
