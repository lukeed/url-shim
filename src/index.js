function toErr(msg, code, err) {
	err = new TypeError(msg);
	err.name += ' [' + code + ']';
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

export function URLSearchParams(init) {
	var k, i, x, tmp, obj={};

	if (init) {
		if (!!init.keys && !!init.getAll) {
			tmp = init.keys();
			for (i=0; i < tmp.length; i++) {
				toAppend(tmp[i], init.getAll(tmp[i]));
			}
		} else if (!!init.pop) {
			for (i=0; i < init.length; i++) {
				toAppend.apply(0, init[i]);
			}
		} else if (typeof init === 'object') {
			for (k in init) toSet(k, init[k]);
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

	function toKeys() {
		tmp = [];
		for (k in obj) {
			for (i=0; i < obj[k].length; i++) {
				tmp.push(k);
			}
		}
		return tmp;
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

	return {
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
			return tmp;
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
		keys: toKeys,
		set: toSet,
		sort: function () {
			tmp = {};
			k = toKeys().sort();
			for (i=0; i < k.length; i++) {
				tmp[k[i]] = obj[k[i]];
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
			return tmp;
		}
	};
}

export function URL(url, base) {
	var link = document.createElement('a');
	var input = document.createElement('input');
	var segs, getter = function () {return link.href};

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

	return {
		href: link.href,
		// @see https://url.spec.whatwg.org/#concept-url-origin
		origin: /(blob|ftp|wss?|https?):/.test(link.protocol) ? link.origin : 'null',
		protocol: link.protocol,
		username: link.username,
		password: link.password,
		host: link.host,
		hostname: link.hostname,
		port: link.port,
		pathname: link.pathname.replace(/^\/{2,}/, '/'),
		search: link.search,
		searchParams: new URLSearchParams(link.search),
		hash: link.hash,
		toString: getter,
		toJSON: getter,
	};
}
