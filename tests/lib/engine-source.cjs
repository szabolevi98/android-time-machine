// The engine code of a version, for the tests that read it: its simulator.js and, as the version moves onto the module
// core (docs/plans/engine-migration.md), its core and modules: the scripts of its own folder named <prefix>-core.js or
// registering a screen (GB / ICS / JB / KK / LP.register), in the order its index.html loads them.
const fs = require('node:fs');
module.exports = v => {
  const dir = `versions/${v}/`, html = fs.readFileSync(dir + 'index.html', 'utf8');
  const files = [...html.matchAll(/<script[^>]*\ssrc="([\w.-]+\.js)(?:\?[^"]*)?"/g)].map(m => m[1]).filter(f => fs.existsSync(dir + f));
  return files.map(f => [f, fs.readFileSync(dir + f, 'utf8')]).filter(([f, s]) => f === 'simulator.js' || /-core\.js$/.test(f) || /\b(GB|ICS|JB|KK|LP)\.register\(/.test(s)).map(([, s]) => s).join('\n');
};
