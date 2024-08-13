import * as kiwi from '@lume/kiwi';

export class Solver {
	private static _instance: kiwi.Solver | null;

	constructor() {}

	public static get instance(): kiwi.Solver {
		if (!Solver._instance) Solver._instance = new kiwi.Solver();
		return Solver._instance;
	}
}
