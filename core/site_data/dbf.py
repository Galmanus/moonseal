# Minimal dBASE III reader for the USGS nomenclature shapefile's attribute table (no GDAL here).
import struct

def read_dbf(path):
    with open(path, 'rb') as f:
        head = f.read(32)
        nrec, hlen, rlen = struct.unpack('<IHH', head[4:12])
        fields = []
        while True:
            d = f.read(32)
            if d[0] == 0x0D:
                break
            name = d[:11].split(b'\x00')[0].decode('ascii')
            fields.append((name, chr(d[11]), d[16], d[17]))
        f.seek(hlen)
        for _ in range(nrec):
            r = f.read(rlen)
            if not r or r[0:1] == b'*':           # deleted record
                continue
            pos, row = 1, {}
            for name, typ, ln, dec in fields:
                raw = r[pos:pos + ln]
                pos += ln
                row[name] = raw.decode('utf-8', 'replace').strip()
            yield fields, row
