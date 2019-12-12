export function URLSearchParams(init) {

}

function invalid(str) {
	var err = new TypeError(`Invalid URL: ${str}`);
	err.code = 'ERR_INVALID_URL';
	throw err;
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
