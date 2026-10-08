#!/usr/bin/env python3
"""Packs PNG images into a Windows .ico file (PNG-compressed entries, Vista+).

Usage: python3 scripts/make-ico.py build/icon.ico icon-16.png icon-32.png ... icon-256.png
Windows picks the best size for each place it shows the icon (lists, tiles, taskbar).
"""
import struct
import sys

out, *pngs = sys.argv[1:]
images = []
for path in pngs:
    data = open(path, 'rb').read()
    assert data[:8] == b'\x89PNG\r\n\x1a\n', f'{path} is not a PNG'
    width, height = struct.unpack('>II', data[16:24])
    assert width == height and width <= 256, f'{path}: {width}x{height}'
    images.append((width, data))
images.sort()

header = struct.pack('<HHH', 0, 1, len(images))
offset = 6 + 16 * len(images)
entries, blobs = b'', b''
for size, data in images:
    # A width/height byte of 0 means 256.
    entries += struct.pack('<BBBBHHII', size % 256, size % 256, 0, 0, 1, 32, len(data), offset)
    blobs += data
    offset += len(data)
open(out, 'wb').write(header + entries + blobs)
print(f'{out}: {len(images)} sizes ({", ".join(str(s) for s, _ in images)})')
