import url from 'url';
import * as lib from '../../src';

export function parse(obj) {
	let k, out={};
	for (k in obj) {
		if (k !== 'searchParams' && typeof obj[k] !== 'function') {
			out[k] = obj[k];
		}
	}
	return out;
}

export function compare(ctor, ...args) {
	const local = new lib[ctor](...args);
	const native = new url[ctor](...args);
	return [local, native].map(parse);
}

export function toErrors(ctor, ...args) {
	let local, native;

	try {
		new lib[ctor](...args);
	} catch (err) {
		local = {
			name: err.name,
			message: err.message,
			code: err.code,
		};
	}

	try {
		new url[ctor](...args);
	} catch (err) {
		native = {
			name: err.name,
			message: err.message,
			code: err.code,
		};
	}

	return [local, native];
}
