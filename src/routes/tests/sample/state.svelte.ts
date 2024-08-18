import type { Block } from '$lib/db/schema';
import * as kiwi from '@lume/kiwi';

export const blocks = $state<Block[]>();
export const queue = $state<Block[]>([]);

export const inBlock = $state<Block | null>(null);
export const outBlock = $state<Block | null>(null);
export const currentConstraint = $state<kiwi.Constraint | null>(null);
