import { dev } from '$app/environment';

export function log<T>(arg: T) {
	if (dev) console.log(arg);
	return arg;
}
