"""Android 6.0.1 and 7.1.2: the factory image's apps are pre-optimised, so their APKs carry no classes.dex; the code is in the OAT
file next to them (/system/app/X/oat/arm64/X.odex, /system/framework/arm64/boot*.oat). An OAT file (ELF, OAT version 064)
keeps every dex file it was made from whole inside its oatdata section, so this cuts them out by their header:
"dex\\n035\\0" (or 037 on 7.x) magic, then file_size at offset 32.
    python docs/tools/oat2dex.py <file.odex | file.oat> <out dir>
Writes classes.dex, classes2.dex … in the order they appear. Methods the dex2oat compiler left to the interpreter hold
ART's quickened opcodes (iget-quick and friends, 0xe3-0xf2 in ART 6.0, and 0x73 return-void-no-barrier); the compiled
ones keep their original bytecode. dequicken() turns them back into plain instructions (see there).
The SHA-1 signature and Adler-32 checksum are recomputed, since quickening changed bytes after they were written."""
import hashlib, os, struct, sys, zlib

# Dalvik instruction widths in 16-bit code units by opcode (the formats of dalvik-bytecode), and ART 6.0's quickened
# opcodes with the plain one each replaces. Dequickening keeps a dex reader's analysis (androguard's) from stopping at
# the first quickened method: return-void-no-barrier becomes return-void exactly; a quickened field access or virtual
# call carries an object offset or vtable index instead of a field or method index, which the dex alone cannot resolve,
# so it becomes the plain instruction naming field 0 / method 0, and the tool lists those methods ("unresolved").
WIDTH = [1] * 256
for lo, hi, w in ((0x02, 0x02, 2), (0x03, 0x03, 3), (0x05, 0x05, 2), (0x06, 0x06, 3), (0x08, 0x08, 2), (0x09, 0x09, 3),
                  (0x13, 0x13, 2), (0x14, 0x14, 3), (0x15, 0x16, 2), (0x17, 0x17, 3), (0x18, 0x18, 5), (0x19, 0x1a, 2),
                  (0x1b, 0x1b, 3), (0x1c, 0x1c, 2), (0x1f, 0x20, 2), (0x22, 0x23, 2), (0x24, 0x26, 3), (0x29, 0x29, 2),
                  (0x2a, 0x2c, 3), (0x2d, 0x3d, 2), (0x44, 0x6d, 2), (0x6e, 0x72, 3), (0x74, 0x78, 3), (0x90, 0xaf, 2),
                  (0xd0, 0xe2, 2), (0xe3, 0xe8, 2), (0xe9, 0xea, 3), (0xeb, 0xf2, 2)):
    for op in range(lo, hi + 1): WIDTH[op] = w
PLAIN = {0x73: 0x0e, 0xe3: 0x52, 0xe4: 0x53, 0xe5: 0x54, 0xe6: 0x59, 0xe7: 0x5a, 0xe8: 0x5b, 0xe9: 0x6e, 0xea: 0x74,
         0xeb: 0x5c, 0xec: 0x5d, 0xed: 0x5e, 0xee: 0x5f, 0xef: 0x55, 0xf0: 0x56, 0xf1: 0x57, 0xf2: 0x58}


def uleb(buf, pos):
    value = shift = 0
    while True:
        b = buf[pos]; pos += 1
        value |= (b & 0x7f) << shift; shift += 7
        if b < 0x80: return value, pos


def dequicken(dex):
    """Rewrites the quickened instructions of every method in place; returns (methods changed, methods unresolved)."""
    count, class_defs = struct.unpack_from('<II', dex, 0x60)
    changed = unresolved = 0
    for c in range(count):
        data_off = struct.unpack_from('<I', dex, class_defs + c * 32 + 24)[0]
        if not data_off: continue
        pos = data_off
        sf, pos = uleb(dex, pos); inf, pos = uleb(dex, pos); dm, pos = uleb(dex, pos); vm, pos = uleb(dex, pos)
        for _ in range(sf + inf): _, pos = uleb(dex, pos); _, pos = uleb(dex, pos)
        for _ in range(dm + vm):
            _, pos = uleb(dex, pos); _, pos = uleb(dex, pos); code_off, pos = uleb(dex, pos)
            if not code_off: continue
            size = struct.unpack_from('<I', dex, code_off + 12)[0]
            base, i, hit, loose = code_off + 16, 0, False, False
            while i < size:
                unit = struct.unpack_from('<H', dex, base + i * 2)[0]
                op = unit & 0xff
                if unit in (0x100, 0x200, 0x300):  # switch and array payloads
                    n = struct.unpack_from('<H', dex, base + i * 2 + 2)[0]
                    if unit == 0x100: i += n * 2 + 4
                    elif unit == 0x200: i += n * 4 + 2
                    else: i += (n * struct.unpack_from('<I', dex, base + i * 2 + 4)[0] + 1) // 2 + 4
                    continue
                if op in PLAIN:
                    hit = True
                    dex[base + i * 2] = PLAIN[op]
                    if op != 0x73:
                        loose = True
                        struct.pack_into('<H', dex, base + i * 2 + 2, 0)
                i += WIDTH[op]
            changed += hit; unresolved += loose
    return changed, unresolved


src, out = sys.argv[1], sys.argv[2]
data = open(src, 'rb').read()
os.makedirs(out, exist_ok=True)
pos, n, found = 0, 0, []
while True:
    # dex 035 (6.0.1) or 037 (7.x): the first of either from here on.
    hits = [p for p in (data.find(b'dex\n035\x00', pos), data.find(b'dex\n037\x00', pos)) if p >= 0]
    if not hits: break
    pos = min(hits)
    size = struct.unpack_from('<I', data, pos + 32)[0]
    header = struct.unpack_from('<I', data, pos + 36)[0]
    # A real dex header is 0x70 bytes long and fits in the file; anything else is a string that happens to match.
    if header == 0x70 and pos + size <= len(data):
        n += 1
        name = 'classes.dex' if n == 1 else f'classes{n}.dex'
        dex = bytearray(data[pos:pos + size])
        changed, unresolved = dequicken(dex)
        if changed: print(f'{name}: {changed} quickened methods rewritten, {unresolved} with field 0 / method 0 for an unresolved access')
        # Quickening rewrote instructions after dex2oat checked the file: refresh the SHA-1 signature and the Adler-32
        # checksum so dex readers (androguard) accept it.
        dex[12:32] = hashlib.sha1(dex[32:]).digest()
        dex[8:12] = struct.pack('<I', zlib.adler32(bytes(dex[12:])))
        open(os.path.join(out, name), 'wb').write(dex)
        found.append((name, size))
        pos += size
    else:
        pos += 8
for name, size in found: print(os.path.join(out, name), size)
if not found: sys.exit(f'no dex in {src}')
