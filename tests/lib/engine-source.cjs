// A version's engine as the page loads it (docs/plans/engine-migration.md): the code moves out of simulator.js into
// its core and modules, so a test that looks for a piece of it reads all of the version's own scripts, in the order
// index.html loads them.
const fs = require('node:fs'), path = require('node:path');
module.exports = version => {
  const dir = path.join(__dirname, '..', '..', 'versions', version);
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  return [...html.matchAll(/<script[^>]*\ssrc="([^"/?]+)(?:\?[^"]*)?"/g)].map(m => fs.readFileSync(path.join(dir, m[1]), 'utf8')).join('\n');
};
