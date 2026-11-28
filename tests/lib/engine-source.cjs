// A version's engine as one text, for the tests that look into it: simulator.js while it lasts, then the module core
// it moves into (docs/plans/engine-migration.md): <pfx>-core.js and every <pfx>-*.js module that registers itself.
//   const source = require('./lib/engine-source.cjs'); source('5.1.1')
const fs = require('node:fs'), path = require('node:path');
const PREFIX = {'2.3.6': 'gb', '4.0.4': 'ics', '4.3': 'jb', '4.4.4': 'kk', '5.1.1': 'lp'};
const ROOT = path.join(__dirname, '..', '..', 'versions');
module.exports = function engineSource(version) {
  const dir = path.join(ROOT, version), pfx = PREFIX[version], parts = [];
  const sim = path.join(dir, 'simulator.js');
  if (fs.existsSync(sim)) parts.push(fs.readFileSync(sim, 'utf8'));
  if (pfx) {
    const core = new RegExp(`^${pfx}-core\\.js$`), module = new RegExp(`^${pfx}-.*\\.js$`), registers = new RegExp(`\\b${pfx.toUpperCase()}\\.(define|register)\\(`);
    for (const file of fs.readdirSync(dir).sort()) {
      if (!module.test(file)) continue;
      const text = fs.readFileSync(path.join(dir, file), 'utf8');
      if (core.test(file) || registers.test(text)) parts.push(text);
    }
  }
  // 5.1.1's moved code reads the core's changing bindings and shared functions through lp (lp-core.js: lp.data,
  // lp.pointerStart, lp.cameraShoot()); the tests read it as the core had it.
  const text = parts.join('\n');
  return version === '5.1.1' ? text.replace(/([{,]\s*)([A-Za-z_$][\w$]*): lp\.\2\b/g, '$1$2').replace(/\blp\.(?=[A-Za-z_$])/g, '') : text;
};
