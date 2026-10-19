"""Reads ICU resource bundles out of a factory image's ICU common data file (/system/usr/icu/icudtNNl.dat), as libicu on
the phone did: the .dat table of contents, then the binary "ResB" bundles (format 1.x / 2.x, with the pool bundle that
locale trees such as zone/ and region/ share their keys with). Enough for the time zone and country names the Calendar's
time zone picker shows.
    dat = IcuData('path/to/icudt50l.dat')
    dat.get('zone', 'hu', 'zoneStrings', 'meta:Europe_Central', 'ls')   -> 'közép-európai téli idő' (locale fallback to root)
Values come back as str (strings, aliases as ('alias', path)), int, list or dict."""
import struct


class Bundle:
    def __init__(self, data, pool=None):
        self.d, self.pool = data, pool
        self.root = self.u32(0)
        count = self.u32(4) & 0xff
        self.indexes = [self.u32(4 + 4 * i) for i in range(count)]
        keys_top = self.indexes[1] if count > 1 else 0
        self.local_key_limit = keys_top * 4
        self.p16 = keys_top * 4                       # 16-bit units follow the key strings (format 2)
        self.pool_keys = (1 + count) * 4              # where a pool bundle's own keys start
        # ICU 56+ (7.1.2's icudt56l): a bundle may use the pool bundle's 16-bit strings too. Offsets under these limits
        # are pool strings; the others are local ones, shifted by the limit (uresdata.cpp, makeResourceFrom16).
        att = self.indexes[5] if count > 5 else 0
        self.pool_str_limit = (self.indexes[0] >> 8) | ((att & 0xf000) << 12) if count > 5 else 0
        self.pool_str16_limit = att >> 16

    def u32(self, p): return struct.unpack_from('<I', self.d, p)[0]
    def i32(self, p): return struct.unpack_from('<i', self.d, p)[0]
    def u16(self, p): return struct.unpack_from('<H', self.d, p)[0]
    def cstr(self, data, p):
        end = data.index(b'\0', p)
        return data[p:end].decode('ascii')

    def key16(self, off):
        # Key offsets count from the bundle's root; those past its own key strings point into its tree's pool bundle.
        # ICU 50 (4.3) keeps the zone/ and region/ keys in the pool only: there the offsets count from the pool's keys.
        if self.pool is None or (self.pool_keys < self.local_key_limit and off < self.local_key_limit):
            return self.cstr(self.d, off)
        if self.local_key_limit <= self.pool_keys:
            return self.cstr(self.pool.d, self.pool.pool_keys + off)
        return self.cstr(self.pool.d, self.pool.pool_keys + off - self.local_key_limit)

    def key32(self, off):
        if off >= 0 and self.pool is None:
            return self.cstr(self.d, off)
        return self.cstr(self.pool.d, self.pool.pool_keys + (off & 0x7fffffff))

    def string16(self, off):
        if self.pool is not None and self.pool_str_limit:
            if off < self.pool_str_limit:
                return self.pool.string16(off)
            off -= self.pool_str_limit
        p = self.p16 + off * 2
        first = self.u16(p)
        if first < 0xdc00:
            end = p
            while self.u16(end): end += 2
            return self.d[p:end].decode('utf-16-le')
        if first < 0xdfef:
            n, p = first & 0x3ff, p + 2
        elif first < 0xdfff:
            n, p = ((first - 0xdfef) << 16) | self.u16(p + 2), p + 4
        else:
            n, p = (self.u16(p + 2) << 16) | self.u16(p + 4), p + 6
        return self.d[p:p + 2 * n].decode('utf-16-le')

    def from16(self, res16):
        return (6 << 28) | (res16 if res16 < self.pool_str16_limit else res16 - self.pool_str16_limit + self.pool_str_limit)

    def value(self, res):
        kind, off = res >> 28, res & 0x0fffffff
        if kind in (0, 3):                             # STRING, ALIAS
            if off == 0: return ''
            n = self.i32(off * 4)
            text = self.d[off * 4 + 4:off * 4 + 4 + 2 * n].decode('utf-16-le')
            return ('alias', text) if kind == 3 else text
        if kind == 6:                                  # STRING_V2
            return self.string16(off)
        if kind == 7:                                  # INT (28-bit signed)
            return off - (1 << 28) if off & 0x08000000 else off
        if kind == 1:                                  # BINARY
            n = self.i32(off * 4); return self.d[off * 4 + 4:off * 4 + 4 + n]
        if kind == 14:                                 # INT_VECTOR
            n = self.i32(off * 4); return list(struct.unpack_from('<%di' % n, self.d, off * 4 + 4))
        if kind == 2:                                  # TABLE (16-bit keys, 32-bit items)
            if off == 0: return {}
            p = off * 4; n = self.u16(p)
            keys = [self.u16(p + 2 + 2 * i) for i in range(n)]
            items = p + 2 * (1 + n + ((~n) & 1))
            return {self.key16(keys[i]): (self, self.u32(items + 4 * i)) for i in range(n)}
        if kind == 5:                                  # TABLE16
            p = self.p16 + off * 2; n = self.u16(p)
            return {self.key16(self.u16(p + 2 + 2 * i)): (self, self.from16(self.u16(p + 2 + 2 * (n + i)))) for i in range(n)}
        if kind == 4:                                  # TABLE32
            p = off * 4; n = self.i32(p)
            return {self.key32(self.i32(p + 4 + 4 * i)): (self, self.u32(p + 4 + 4 * (n + i))) for i in range(n)}
        if kind == 8:                                  # ARRAY
            if off == 0: return []
            p = off * 4; n = self.i32(p)
            return [(self, self.u32(p + 4 + 4 * i)) for i in range(n)]
        if kind == 9:                                  # ARRAY16
            p = self.p16 + off * 2; n = self.u16(p)
            return [(self, self.from16(self.u16(p + 2 + 2 * i))) for i in range(n)]
        raise ValueError(f'resource type {kind}')


def resolve(node):
    """A (bundle, resource) pair, fully read: strings, ints, lists and dicts of the same."""
    if isinstance(node, tuple) and len(node) == 2 and isinstance(node[0], Bundle):
        v = node[0].value(node[1])
        if isinstance(v, dict): return {k: resolve(x) for k, x in v.items()}
        if isinstance(v, list): return [resolve(x) for x in v]
        return v
    return node


class IcuData:
    def __init__(self, source):
        self.d = source if isinstance(source, bytes) else open(source, 'rb').read()
        header = struct.unpack_from('<H', self.d, 0)[0]
        toc = header
        n = struct.unpack_from('<I', self.d, toc)[0]
        self.items = {}
        for i in range(n):
            name_off, data_off = struct.unpack_from('<II', self.d, toc + 4 + 8 * i)
            name = self.d[toc + name_off:self.d.index(b'\0', toc + name_off)].decode('ascii')
            self.items[name.split('/', 1)[1]] = toc + data_off
        self.prefix = name.split('/', 1)[0]
        self.bundles = {}

    def bundle(self, name):
        """name like 'zone/hu' or 'metaZones'; None when the data has no such bundle."""
        if name not in self.bundles:
            start = self.items.get(name + '.res')
            if start is None:
                self.bundles[name] = None
            else:
                header = struct.unpack_from('<H', self.d, start)[0]
                end = min((o for o in self.items.values() if o > start), default=len(self.d))
                data = self.d[start + header:end]
                tree = name.rsplit('/', 1)[0] if '/' in name else ''
                b = Bundle(data)
                if len(b.indexes) > 5 and b.indexes[5] & 4:  # URES_ATT_USES_POOL_BUNDLE
                    b.pool = self.bundle((tree + '/' if tree else '') + 'pool')
                self.bundles[name] = b
        return self.bundles[name]

    def raw(self, name, *path):
        """The resource at path in one bundle (no locale fallback), resolved; None when missing."""
        b = self.bundle(name)
        if b is None: return None
        node = (b, b.root)
        for key in path:
            v = node[0].value(node[1])
            if isinstance(v, dict):
                if key not in v: return None
                node = v[key]
            elif isinstance(v, list) and isinstance(key, int):
                node = v[key]
            else:
                return None
        return resolve(node)

    def chain(self, tree, locale):
        """hu_HU -> [hu_HU, hu, root] (the bundles the tree has; %%Parent / aliases are not needed here)."""
        out, parts = [], locale.split('_')
        for i in range(len(parts), 0, -1):
            out.append('_'.join(parts[:i]))
        out.append('root')
        return [f'{tree}/{loc}' for loc in out if self.bundle(f'{tree}/{loc}') is not None]

    def get(self, tree, locale, *path):
        """The value at path with ICU's locale fallback (hu_HU, hu, root)."""
        for name in self.chain(tree, locale):
            v = self.raw(name, *path)
            if v is not None and v != '':
                return v
        return None
