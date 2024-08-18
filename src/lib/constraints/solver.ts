import type { Block, Link } from '$lib/db/schema';
import * as kiwi from '@lume/kiwi';

export class Solver {
	private static _instance: kiwi.Solver | null;

	constructor() {}

	public static get instance(): kiwi.Solver {
		if (!Solver._instance) Solver._instance = new kiwi.Solver();
		return Solver._instance;
	}

	public static suggestBlockCoordinates(
		block: Block,
		x: number,
		y: number,
		strength: number = kiwi.Strength.weak
	) {
		const { x: bx, y: by } = block.coordinates;
		Solver.addEditVariable(bx, strength);
		Solver.instance.suggestValue(bx, x);
		Solver.addEditVariable(by, strength);
		Solver.instance.suggestValue(by, y);
	}

	public static addEditVariable(variable: kiwi.Variable, strength: number = kiwi.Strength.weak) {
		if (!Solver.instance.hasEditVariable(variable)) {
			Solver.instance.addEditVariable(variable, strength);
		}
	}

	public static addLink(link: Link) {
		Solver.instance.addConstraint(link.constraints.main);
		Solver.instance.addConstraint(link.constraints.secondary);
	}

	public static removeLink(link: Link) {
		Solver.instance.removeConstraint(link.constraints.main);
		Solver.instance.removeConstraint(link.constraints.secondary);
	}
}
