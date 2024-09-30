// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { tick } from 'svelte';

export class View {
	redrawKey = $state(0);

	constructor() {}

	redraw() {
		this.redrawKey = Math.random();
	}

	async waitForUpdate() {
		await tick();
	}
}
