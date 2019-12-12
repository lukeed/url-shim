import * as lib from '../src';
import { compare } from './utils';

describe('exports', () => {
	it('should export an object', () => {
		expect(typeof lib).toBe('object');
	});

	it('should export "URL" function', () => {
		expect(typeof lib.URL).toBe('function');
	});

	it('should export "URLSearchParams" function', () => {
		expect(typeof lib.URLSearchParams).toBe('function');
	});
});

describe('URL', () => {
	// TODO
	// describe('TypeErrors', () => {});

	describe('Matches `URL` from Node.js', () => {
		it('file:///C:/demo', () => {
			const [local, native] = compare('URL', 'file:///C:/demo');
			expect(local).toStrictEqual(native);
		});

		it('webpack:///C:/demo', () => {
			const [local, native] = compare('URL', 'webpack:///C:/demo');
			expect(local).toStrictEqual(native);
		});

		it('./hello/world :: http://example.com', () => {
			const [local, native] = compare('URL', './hello/world', 'http://example.com');
			expect(local).toStrictEqual(native);
		});

		it('../hello/world :: http://example.com', () => {
			const [local, native] = compare('URL', '../hello/world', 'http://example.com');
			expect(local).toStrictEqual(native);
		});

		it('/hello/world :: http://example.com', () => {
			const [local, native] = compare('URL', '/hello/world', 'http://example.com');
			expect(local).toStrictEqual(native);
		});

		it('./hello/world :: http://example.com/foo/bar', () => {
			const [local, native] = compare('URL', './hello/world', 'http://example.com/foo/bar');
			expect(local).toStrictEqual(native);
		});

		it('../hello/world :: http://example.com/foo/bar', () => {
			const [local, native] = compare('URL', '../hello/world', 'http://example.com/foo/bar');
			expect(local).toStrictEqual(native);
		});

		it('/hello/world :: http://example.com/foo/bar', () => {
			const [local, native] = compare('URL', '/hello/world', 'http://example.com/foo/bar');
			expect(local).toStrictEqual(native);
		});

		it('/ :: http://example.com/foo/bar', () => {
			const [local, native] = compare('URL', '/', 'http://example.com/foo/bar');
			expect(local).toStrictEqual(native);
		});

		it('/ :: http://example.com/', () => {
			const [local, native] = compare('URL', '/', 'http://example.com/');
			expect(local).toStrictEqual(native);
		});

		it('/ :: http://example.com', () => {
			const [local, native] = compare('URL', '/', 'http://example.com');
			expect(local).toStrictEqual(native);
		});

		it('"" :: http://example.com/foo/bar', () => {
			const [local, native] = compare('URL', '', 'http://example.com/foo/bar');
			expect(local).toStrictEqual(native);
		});

		it('"" :: http://example.com/', () => {
			const [local, native] = compare('URL', '', 'http://example.com/');
			expect(local).toStrictEqual(native);
		});

		it('"" :: http://example.com', () => {
			const [local, native] = compare('URL', '', 'http://example.com');
			expect(local).toStrictEqual(native);
		});
	});
});
