/* A small, dependency-free ZIP writer. Files are stored without recompression:
   JPEG/MP4 are already compressed. Exported archives use standard ZIP32. */
(() => {
  'use strict';
  const table = Uint32Array.from({ length: 256 }, (_, n) => {
    for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
    return n >>> 0;
  });
  function crc32(data) {
    let crc = -1;
    for (const byte of data) crc = (crc >>> 8) ^ table[(crc ^ byte) & 255];
    return (crc ^ -1) >>> 0;
  }
  window.makeLoveZip = async entries => {
    const pieces = [], central = [];
    let offset = 0, centralSize = 0;
    for (const entry of entries) {
      const name = new TextEncoder().encode(entry.name);
      const data = entry.data instanceof Uint8Array ? entry.data : new Uint8Array(await entry.data.arrayBuffer());
      const crc = crc32(data);
      const header = new Uint8Array(30 + name.length);
      const view = new DataView(header.buffer);
      view.setUint32(0, 0x04034b50, true); view.setUint16(4, 20, true);
      view.setUint16(6, 0x0800, true); view.setUint16(12, 0x21, true);
      view.setUint32(14, crc, true); view.setUint32(18, data.length, true); view.setUint32(22, data.length, true);
      view.setUint16(26, name.length, true); header.set(name, 30);
      const directory = new Uint8Array(46 + name.length);
      const dv = new DataView(directory.buffer);
      dv.setUint32(0, 0x02014b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 20, true);
      dv.setUint16(8, 0x0800, true); dv.setUint16(14, 0x21, true);
      dv.setUint32(16, crc, true); dv.setUint32(20, data.length, true); dv.setUint32(24, data.length, true);
      dv.setUint16(28, name.length, true); dv.setUint32(42, offset, true); directory.set(name, 46);
      pieces.push(header, data); central.push(directory); centralSize += directory.length; offset += header.length + data.length;
    }
    const end = new Uint8Array(22), view = new DataView(end.buffer);
    view.setUint32(0, 0x06054b50, true); view.setUint16(8, entries.length, true); view.setUint16(10, entries.length, true);
    view.setUint32(12, centralSize, true); view.setUint32(16, offset, true);
    return new Blob([...pieces, ...central, end], { type: 'application/zip' });
  };
})();
