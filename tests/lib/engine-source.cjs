// A version's engine as the page loads it (docs/plans/engine-migration.md): the code moves out of simulator.js into
// its core and modules, so a test that looks for a piece of it reads all of the version's own scripts, in the order
// index.html loads them.
const fs = require('node:fs'), path = require('node:path');
module.exports = version => {
  const dir = path.join(__dirname, '..', '..', 'versions', version);
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  return [...html.matchAll(/<script[^>]*\ssrc="([^"/?]+)(?:\?[^"]*)?"/g)].map(m => fs.readFileSync(path.join(dir, m[1]), 'utf8')).join('\n');
};
// The version's core alone: simulator.js until the migration replaces it with <pfx>-core.js.
const PREFIX = {'2.3.6': 'gb', '4.0.4': 'ics', '4.3': 'jb', '4.4.4': 'kk', '5.1.1': 'lp'};
module.exports.core = version => {
  const dir = path.join(__dirname, '..', '..', 'versions', version), old = path.join(dir, 'simulator.js');
  return fs.readFileSync(fs.existsSync(old) ? old : path.join(dir, `${PREFIX[version]}-core.js`), 'utf8');
};
