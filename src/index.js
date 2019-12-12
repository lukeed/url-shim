function toErr(msg, code, err) {
	err = new TypeError(msg);
	err.code = code;
	throw err;
}

function invalid(str) {
	toErr('Invalid URL: ' + str, 'ERR_INVALID_URL');
}

function args(both, len, x, y) {
	x = 'The "name" ';
	y = 'argument';

	if (both) {
		x += 'and "value" ';
		y += 's';
	}

	if (len < ++both) {
		toErr(x + y + ' must be specified', 'ERR_MISSING_ARGS');
	}
}

function toIter(arr, supported) {
	var val, j=0, iter = {
		next: function () {
			val = arr[j++];
			return {
				value: val,
				done: j > arr.length
			}
		}
	};

	if (supported) {
		iter[Symbol.iterator] = function () {
			return iter;
		};
	}

	return iter;
}

export function URLSearchParams(init) {
	var k, i, x, supp, tmp, $, obj={};

	try {
		supp = !!Symbol.iterator;
	} catch (e) {
		supp = false;
	}

	if (init) {
		if (!!init.keys && !!init.getAll) {
			init.forEach(function (k, v) {
				toAppend(k, v);
			});
		} else if (!!init.pop) {
			for (i=0; i < init.length; i++) {
				toAppend.apply(0, String(init[i]));
			}
		} else if (typeof init === 'object') {
			for (k in init) toSet(k, String(init[k]));
		} else if (typeof init === 'string') {
			x = decodeURIComponent(init).split('&');
			while (k = x.shift()) {
				i = k.indexOf('=');
				if (!~i) i = k.length;
				toAppend(
					k.substring(0, i),
					k.substring(++i)
				);
			}
		}
	}

	function toSet(key, val) {
		args(1, arguments.length);
		obj[key] = [val];
	}

	function toAppend(key, val) {
		args(1, arguments.length);
		tmp = obj[key] || [];
		obj[key] = tmp.concat(val);
	}

	$ = {
		append: toAppend,
		delete: function (key) {
			args(0, arguments.length);
			delete obj[key];
		},
		entries: function () {
			tmp = [];
			for (k in obj) {
				for (i=0; i < obj[k].length; i++) {
					tmp.push([k, obj[k][i]]);
				}
			}
			return toIter(tmp, supp);
		},
		forEach: function (fn) {
			if (typeof fn != 'function') {
				toErr('Callback must be a function', 'ERR_INVALID_CALLBACK');
			}
			for (k in obj) {
				for (i=0; i < obj[k].length; i++) {
					fn(obj[k][i], k);
				}
			}
		},
		get: function (key) {
			args(0, arguments.length);
			tmp = obj[key];
			return tmp ? tmp[0] : null;
		},
		getAll: function (key) {
			args(0, arguments.length);
			return obj[key] || [];
		},
		has: function (key) {
			args(0, arguments.length);
			return obj[key] !== void 0;
		},
		keys: function () {
			tmp = [];
			for (k in obj) {
				for (i=0; i < obj[k].length; i++) {
					tmp.push(k);
				}
			}
			return toIter(tmp, supp);
		},
		set: toSet,
		sort: function () {
			x = [];
			tmp = {};
			for (k in obj) x.push(k);
			for (i=0; i < x.length; i++) {
				tmp[x[i]] = obj[x[i]];
			}
			obj = tmp;
		},
		toString: function () {
			tmp = '';
			for (k in obj) {
				for (i=0; i < obj[k].length; i++) {
					tmp && (tmp += '&');
					tmp += encodeURIComponent(k) + '=' + encodeURIComponent(obj[k][i]);
				}
			}
			return tmp;
		},
		values: function () {
			tmp = [];
			for (k in obj) {
				tmp = tmp.concat(obj[k]);
			}
			return toIter(tmp, supp);
		}
	};

	if (supp) {
		$[Symbol.iterator] = $.entries;
	}

	return $;
}

export function URL(url, base) {
	var link = document.createElement('a');
	var input = document.createElement('input');
	var segs, getter=link.toString.bind(link);

	input.type = 'url';
	base = String(base || '').trim();
	if ((input.value = base) && !input.checkValidity()) return invalid(base);

	url = String(url).trim();
	input.value = url || 0;

	if (input.checkValidity()) {
		link.href = url; // full
	} else if (base) {
		link.href = base;
		if (url) { // non-empty string
			if (url[0] == '/' || link.pathname === '/') {
				link.href = link.origin + '/' + url.replace(/^\/+/, '');
			} else {
				segs = link.pathname.split('/');
				base = url.replace(/^(\.\/)?/, '').split('../');
				link.href = link.origin + segs.slice(0, Math.max(1, segs.length - base.length)).concat(base.pop()).join('/')
			}
		}
	} else {
		return invalid(url);
	}

	function block(key, getter, readonly, out) {
		out = { enumerable: true };
		out.get = getter || function () { return link[key] };
		if (!readonly) {
			out.set = function (val) {
				if (val != null) {
					link[key] = String(val);
				}
			}
		}
		return out;
	}

	return Object.defineProperties({
		toString: getter,
		toJSON: getter,
	}, {
		href: block('href'),
		protocol: block('protocol'),
		username: block('username'),
		password: block('password'),
		hostname: block('hostname'),
		host: block('host'),
		port: block('port'),
		search: block('search'),
		hash: block('hash'),
		pathname: block('pathname', function () {
			return link.pathname.replace(/^\/{2,}/, '/');
		}),
		origin: block('origin', function () {
			// @see https://url.spec.whatwg.org/#concept-url-origin
			return /(blob|ftp|wss?|https?):/.test(link.protocol) ? link.origin : 'null';
		}, 1),
		searchParams: block('searchParams', function () {
			return new URLSearchParams(link.search);
		}, 1)
	});
}
