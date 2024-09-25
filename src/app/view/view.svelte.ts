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
