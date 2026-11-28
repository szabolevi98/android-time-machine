// A version's engine as the page loads it (docs/plans/engine-migration.md): the code moves out of simulator.js into
// its core and modules, so a test that looks for a piece of it reads all of the version's own scripts, in the order
// index.html loads them.
//   const engineSource = require('./lib/engine-source.cjs'); engineSource('5.1.1'); engineSource.core('5.1.1')
const fs = require('node:fs'), path = require('node:path');
const PREFIX = {'2.3.6': 'gb', '4.0.4': 'ics', '4.3': 'jb', '4.4.4': 'kk', '5.1.1': 'lp'};
const ROOT = path.join(__dirname, '..', '..', 'versions');
module.exports = version => {
  const dir = path.join(ROOT, version);
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const text = [...html.matchAll(/<script[^>]*\ssrc="([^"/?]+)(?:\?[^"]*)?"/g)].map(m => fs.readFileSync(path.join(dir, m[1]), 'utf8')).join('\n');
  // 5.1.1's moved code reads the core's changing bindings and shared functions through lp (lp-core.js: lp.data,
  // lp.pointerStart, lp.cameraShoot()); the tests read it as the core had it.
  return version === '5.1.1' ? text.replace(/([{,]\s*)([A-Za-z_$][\w$]*): lp\.\2\b/g, '$1$2').replace(/\blp\.(?=[A-Za-z_$])/g, '') : text;
};
// The version's core alone: simulator.js until the migration replaces it with <pfx>-core.js.
module.exports.core = version => {
  const dir = path.join(ROOT, version), old = path.join(dir, 'simulator.js');
  return fs.readFileSync(fs.existsSync(old) ? old : path.join(dir, `${PREFIX[version]}-core.js`), 'utf8');
};
