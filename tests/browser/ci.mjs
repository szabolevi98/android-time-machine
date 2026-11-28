// The browser flows split for CI's parallel jobs (.github/workflows/tests.yml): one job per version, plus one for the
// flows that are not per version. Together they run what `npm run test:browser` runs one after another.
//     node tests/browser/ci.mjs <version>    that version's part of the per-version scripts
//     node tests/browser/ci.mjs shared       the 6.0.1/7.1.2 system flows, the launcher and Nougat checks, easter eggs
//     node tests/browser/ci.mjs --list       what each job runs
import {spawnSync} from 'node:child_process';

const ALL = ['2.1', '2.3.6', '4.0.4', '4.3', '4.4.4', '5.1.1', '6.0.1', '7.1.2'];
// [script, the versions it covers, the arguments that pick one version]
const PER_VERSION = [
  ['boot-startup', ALL, v => [v]],
  ['flows', ['2.1', '2.3.6', '4.0.4', '4.3', '4.4.4', '5.1.1', '6.0.1'], v => [v]],
  ['wallpaper-scroll', ['5.1.1', '6.0.1'], v => [v]],
  ['limits-regression', ALL, v => ['--version', v]],
  ['drawer-mouse', ['4.0.4', '4.3', '4.4.4', '5.1.1'], v => [v]],
  ['store-apps', ALL, v => [v]]
];
const SHARED = ['launcher-lifecycle', 'ng-release', 'ng-wallpaper', 'system-browser-mail', 'system-smallapps', 'system-store-games', 'system-settings-effects', 'cell-broadcasts', 'easter-eggs'];

const job = process.argv[2];
const steps = job === 'shared' ? SHARED.map(s => [s, []]) : ALL.includes(job) ? PER_VERSION.filter(([, vs]) => vs.includes(job)).map(([s, , args]) => [s, args(job)]) : null;
if (process.argv.includes('--list')) {
  for (const j of [...ALL, 'shared']) console.log(j.padEnd(7), (j === 'shared' ? SHARED : PER_VERSION.filter(([, vs]) => vs.includes(j)).map(([s]) => s)).join(', '));
  process.exit(0);
}
if (!steps) { console.error(`usage: node tests/browser/ci.mjs <${ALL.join('|')}|shared>`); process.exit(2); }
for (const [script, args] of steps) {
  console.log(`\n▶ ${script} ${args.join(' ')}`);
  const started = Date.now(), r = spawnSync(process.execPath, [`tests/browser/${script}.mjs`, ...args], {stdio: 'inherit'});
  console.log(`◀ ${script}: ${r.status === 0 ? 'passed' : 'FAILED'} in ${Math.round((Date.now() - started) / 1000)} s`);
  if (r.status !== 0) process.exit(r.status || 1);
}
