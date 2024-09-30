// SPDX-FileCopyrightText: 2024 Giovanni Abbatepaolo <bbt.gnn@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { dev } from '$app/environment';
import type { Action } from 'svelte/action';

//

export function log<T>(arg: T) {
	if (dev) console.log(arg);
	return arg;
}

//

export const clickOutside: Action<HTMLElement, () => void> = (element, callbackFunction) => {
	function onClick(event: MouseEvent) {
		if (event.target instanceof Node && !element.contains(event.target)) {
			callbackFunction();
		}
	}

	document.body.addEventListener('click', onClick);

	return {
		update(newCallbackFunction) {
			callbackFunction = newCallbackFunction;
		},
		destroy() {
			document.body.removeEventListener('click', onClick);
		}
	};
};
