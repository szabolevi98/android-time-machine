// The browser flows split for CI (.github/workflows/tests.yml). Every push runs the quick smoke job; the full set (nightly
// and on demand) runs in parallel jobs: one per version, plus one for the flows that are not per version. Together they
// run what `npm run test:browser` runs one after another.
//     node tests/browser/ci.mjs <version>    that version's part of the per-version scripts
//     node tests/browser/ci.mjs 5.1.1b       the second half of 5.1.1's limits-regression cases
//     node tests/browser/ci.mjs shared       the 6.0.1/7.1.2 system flows, the launcher and Nougat checks, easter eggs
//     node tests/browser/ci.mjs smoke        every push's quick check: the boots and the basic flows of all versions
//     node tests/browser/ci.mjs --list       what each job runs
import {spawnSync} from 'node:child_process';

const ALL = ['2.1', '2.3.6', '4.0.4', '4.3', '4.4.4', '5.1.1', '6.0.1', '7.1.2'];
// [script, the versions it covers, the arguments that pick one version]
const PER_VERSION = [
  ['boot-startup', ALL, v => [v]],
  ['flows', ['2.1', '2.3.6', '4.0.4', '4.3', '4.4.4', '5.1.1', '6.0.1'], v => [v]],
  ['wallpaper-scroll', ['5.1.1', '6.0.1'], v => [v]],
  // 5.1.1 has the most cases: its job runs half of them and the 5.1.1b job the other half.
  ['limits-regression', ALL, v => ['--version', v, ...(v === '5.1.1' ? ['--part', '1/2'] : [])]],
  ['drawer-mouse', ['4.0.4', '4.3', '4.4.4', '5.1.1'], v => [v]],
  ['store-apps', ALL, v => [v]]
];
// Every push's quick check: all eight versions boot, and each version's basic flows work.
const SMOKE = ['boot-startup', 'flows'];
const SHARED = ['launcher-lifecycle', 'ng-release', 'ng-wallpaper', 'system-browser-mail', 'system-smallapps', 'system-store-games', 'system-settings-effects', 'cell-broadcasts', 'easter-eggs'];

const job = process.argv[2];
const steps = job === 'smoke' ? SMOKE.map(s => [s, []]) : job === 'shared' ? SHARED.map(s => [s, []]) : job === '5.1.1b' ? [['limits-regression', ['--version', '5.1.1', '--part', '2/2']]] : ALL.includes(job) ? PER_VERSION.filter(([, vs]) => vs.includes(job)).map(([s, , args]) => [s, args(job)]) : null;
if (process.argv.includes('--list')) {
  for (const j of ['smoke', ...ALL, '5.1.1b', 'shared']) console.log(j.padEnd(7), (j === 'smoke' ? SMOKE : j === 'shared' ? SHARED : j === '5.1.1b' ? ['limits-regression (second half of 5.1.1)'] : PER_VERSION.filter(([, vs]) => vs.includes(j)).map(([s]) => s)).join(', '));
  process.exit(0);
}
if (!steps) { console.error(`usage: node tests/browser/ci.mjs <${ALL.join('|')}|5.1.1b|shared|smoke>`); process.exit(2); }
for (const [script, args] of steps) {
  console.log(`\n▶ ${script} ${args.join(' ')}`);
  const started = Date.now(), r = spawnSync(process.execPath, [`tests/browser/${script}.mjs`, ...args], {stdio: 'inherit'});
  console.log(`◀ ${script}: ${r.status === 0 ? 'passed' : 'FAILED'} in ${Math.round((Date.now() - started) / 1000)} s`);
  if (r.status !== 0) process.exit(r.status || 1);
}
