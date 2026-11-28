// Audit point 11: every local asset the five versions reference, checked two ways.
//   static   the url()s of the stylesheets each index.html loads (resolved against the stylesheet's folder) and the literal
//            "assets/…" paths in its scripts and page, matched case-sensitively against the files (as a Linux server does)
//   runtime  headless Chrome opens every app the version lists and records local requests that fail (needs a server for
//            the repository root, BASE, default http://localhost:8090)
// Writes docs/reports/asset-check.md.   node docs/tools/asset-check.mjs [--static] [version...]
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import {createHash} from 'node:crypto';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../..');
const BASE = process.env.BASE || 'http://localhost:8090';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const args = process.argv.slice(2), staticOnly = args.includes('--static');
const picked = args.filter(a => /^\d/.test(a));
const versions = picked.length ? picked : fs.readdirSync(path.join(ROOT, 'versions')).filter(v => /^\d/.test(v));
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Exact-case existence: every path segment must be listed by its folder.
const listing = new Map();
function exists(rel) {
  let dir = ROOT;
  for (const part of rel.split('/').filter(Boolean)) {
    if (part === '..') { dir = path.dirname(dir); continue; }
    if (!listing.has(dir)) { try { listing.set(dir, new Set(fs.readdirSync(dir))); } catch { listing.set(dir, new Set()); } }
    if (!listing.get(dir).has(part)) return false;
    dir = path.join(dir, part);
  }
  return true;
}
const norm = p => path.posix.normalize(p).replace(/^\.\//, '');
// References that sit in branches the version never takes (checked by hand; not visible images).
const KNOWN = {
  'versions/4.3/settings-system.js assets/ic_google_account.png': "the shared template's ICS branch (ICS is false on 4.3)",
  'versions/4.4.4/settings-system.js assets/ic_google_account.png': "the shared template's ICS branch",
  'versions/5.1.1/settings-system.js assets/ic_google_account.png': "the shared template's ICS branch",
  'versions/4.3/simulator.js assets/people-ic_dialog_alert_holo_light.png': "the delete dialog's title only ICS has (PeopleStrings.has('Delete contact?'))",
  'versions/4.4.4/kk-people.js assets/people-ic_dialog_alert_holo_light.png': "the delete dialog's title only ICS has",
  'versions/5.1.1/chrome.js assets/ic_ab_back_holo_light.png': 'the Holo up arrow of the shared Chrome code; 5.1.1 draws the Material bar',
  'versions/5.1.1/email-prefs.js assets/ic_ab_back_holo_light.png': 'the Holo up arrow; 5.1.1 takes the material branch',
};

export function staticCheck(version) {
  const page = `versions/${version}/index.html`, html = fs.readFileSync(path.join(ROOT, page), 'utf8');
  const sheets = [...html.matchAll(/<link[^>]*href="([^"?]+\.css)/g)].map(m => norm(`versions/${version}/${m[1]}`));
  const scripts = [...html.matchAll(/<script[^>]*src="([^"?]+)/g)].map(m => norm(`versions/${version}/${m[1]}`));
  const missing = [], dynamic = new Set();
  for (const sheet of sheets) {
    if (!exists(sheet)) { missing.push([page, sheet]); continue; }
    const css = fs.readFileSync(path.join(ROOT, sheet), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) {
      const url = m[2].split(/[?#]/)[0];
      if (/^(data:|https?:|\/\/|#|%23)/.test(url)) continue;
      const rel = norm(path.posix.join(path.posix.dirname(sheet), url));
      if (!exists(rel)) missing.push([sheet, url]);
    }
  }
  for (const file of [page, ...scripts]) {
    if (!exists(file)) { missing.push([page, file]); continue; }
    const s = fs.readFileSync(path.join(ROOT, file), 'utf8');
    for (const m of s.matchAll(/(['"`(])((?:\.\.\/)*assets\/[^'"`)\s?#]*)/g)) {
      const ref = m[2];
      if (/\$\{|\+$|[<*]/.test(ref) || !/\.[a-z0-9]+$/i.test(ref)) { dynamic.add(`${file}: ${ref}`); continue; }
      if (KNOWN[`${file} ${ref}`]) continue;
      if (!exists(norm(`versions/${version}/${ref}`))) missing.push([file, ref]);
    }
  }
  return {sheets: sheets.length, scripts: scripts.length, missing, dynamic: dynamic.size};
}

// The asset folder's inventory: byte-identical groups, and files no loaded script, stylesheet or page names literally.
// A file can still be named by a built-up path (an app id plus a suffix), so "unnamed" is a list to review, not to delete.
export function inventory(version) {
  const dir = path.join(ROOT, 'versions', version, 'assets'), files = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isFile());
  const page = fs.readFileSync(path.join(ROOT, 'versions', version, 'index.html'), 'utf8');
  const loaded = [`versions/${version}/index.html`, ...[...page.matchAll(/(?:src|href)="([^"?]+\.(?:js|css))/g)].map(m => norm(`versions/${version}/${m[1]}`))].filter(exists);
  const text = loaded.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
  const groups = new Map();
  for (const f of files) { const hash = createHash('md5').update(fs.readFileSync(path.join(dir, f))).digest('hex'); groups.set(hash, [...(groups.get(hash) || []), f]); }
  const duplicates = [...groups.values()].filter(g => g.length > 1);
  const extra = duplicates.reduce((n, g) => n + fs.statSync(path.join(dir, g[0])).size * (g.length - 1), 0);
  // Helpers add a prefix ("gb-cal-", "ps4510-") or a state suffix to a resource name: a file counts as named when its stem,
  // or the stem without one or two prefixes, is quoted in the code.
  const stems = f => { const s = f.replace(/\.[a-z0-9]+$/i, ''), out = [s]; let t = s; for (let i = 0; i < 2 && /^[a-z0-9]+-/.test(t); i++) out.push(t = t.replace(/^[a-z0-9]+-/, '')); return out; };
  const unnamed = files.filter(f => !text.includes(f) && !stems(f).some(s => new RegExp(`['"\`(/-]${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`).]`).test(text)));
  return {files: files.length, duplicates, extra, unnamed};
}

function apps(version) {
  const dir = path.join(ROOT, 'versions', version), ids = new Set();
  for (const f of fs.readdirSync(dir).filter(f => /\.(js|html)$/.test(f))) {
    const s = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const m of s.matchAll(/data-app="([a-z0-9][a-z0-9-]+)"/g)) ids.add(m[1]);
    for (const m of s.matchAll(/\[\s*'([a-z][a-z0-9-]+)',\s*'[A-Z][^']*',/g)) ids.add(m[1]);
  }
  return [...ids].sort();
}
export async function runtimeCheck(version) {
  const port = 9300 + Math.floor(Math.random() * 500), dir = fs.mkdtempSync(path.join(os.tmpdir(), 'asset-check-'));
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, 'about:blank'], {stdio: 'ignore'});
  let ws;
  for (let i = 0; i < 120 && !ws; i++) { try { const p = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {} if (!ws) await sleep(250); }
  await new Promise(r => ws.onopen = r);
  let id = 0; const pending = {}, failed = new Set(), urls = {}, loaded = new Set();
  ws.onmessage = m => {
    const d = JSON.parse(m.data);
    if (d.method === 'Network.requestWillBeSent') { urls[d.params.requestId] = d.params.request.url; const m = d.params.request.url.match(/\/versions\/[^/]+\/assets\/([^?#]+)/); if (m) loaded.add(decodeURIComponent(m[1])); }
    if (d.method === 'Network.responseReceived' && d.params.response.status >= 400 && d.params.response.url.startsWith(BASE)) failed.add(`${d.params.response.status} ${d.params.response.url.slice(BASE.length)}`);
    if (d.method === 'Network.loadingFailed' && (urls[d.params.requestId] || '').startsWith(BASE) && !d.params.canceled) failed.add(`${d.params.errorText} ${urls[d.params.requestId].slice(BASE.length)}`);
    if (pending[d.id]) { pending[d.id](d); delete pending[d.id]; }
  };
  const send = (method, params = {}) => new Promise(r => { pending[++id] = r; ws.send(JSON.stringify({id, method, params})); });
  const ev = async e => (await send('Runtime.evaluate', {expression: e, returnByValue: true})).result?.result?.value;
  await send('Network.enable'); await send('Network.setCacheDisabled', {cacheDisabled: true});
  await send('Emulation.setDeviceMetricsOverride', {width: 420, height: 900, deviceScaleFactor: 2, mobile: false});
  await send('Page.navigate', {url: `${BASE}/versions/${version}/`}); await sleep(400);
  await ev(`localStorage.clear()`);
  await send('Page.navigate', {url: `${BASE}/versions/${version}/`}); await sleep(3000);
  const click = (a, x = '') => ev(`(()=>{const el=document.createElement('button');el.dataset.action=${JSON.stringify(a)};${x}const h=document.querySelector('#viewport')?.firstElementChild||document.querySelector('#viewport');if(!h)return;h.append(el);el.click();el.remove();})()`);
  const list = apps(version);
  for (const app of list) { await click('home'); await sleep(150); await click('open-app', `el.dataset.app=${JSON.stringify(app)};`); await sleep(600); }
  await sleep(1000);
  ws.close(); proc.kill();
  // PHP's built-in server sometimes refuses a connection under the burst of requests; a file it serves on a second try is
  // not missing.
  for (const f of [...failed]) {
    const m = f.match(/^net::ERR_CONNECTION_\w+ (\S+)$/);
    if (m && (await fetch(BASE + m[1]).catch(() => null))?.ok) failed.delete(f);
  }
  return {apps: list.length, failed: [...failed].sort(), loaded};
}

// Run directly it checks and writes the report; imported (tests) it only lends staticCheck.
if (process.argv[1] && path.resolve(process.argv[1]) === path.join(ROOT, 'docs', 'tools', 'asset-check.mjs')) {
  const out = ['# Asset check', '', 'Generated by `docs/tools/asset-check.mjs` (audit point 11): the stylesheets\' url()s and the scripts\' literal `assets/…` paths each version loads, matched case-sensitively; and the local requests that failed while every app was opened in headless Chrome.', ''];
  let problems = 0;
  for (const v of versions) {
    const s = staticCheck(v);
    out.push(`## ${v}`, '', `Static: ${s.sheets} stylesheets, ${s.scripts} scripts; ${s.missing.length} missing, ${s.dynamic} references built at run time (left to the runtime check).`, '');
    for (const [from, ref] of s.missing) out.push(`- missing: \`${ref}\` (${from})`);
    problems += s.missing.length;
    if (!staticOnly) {
      const r = await runtimeCheck(v);
      out.push('', `Runtime: ${r.apps} apps opened; ${r.failed.length} failed requests.`, '');
      for (const f of r.failed) out.push(`- ${f}`);
      problems += r.failed.length;
      console.log(v, s.missing.length, 'static,', r.failed.length, 'runtime');
      // The inventory (low priority, nothing is deleted from it): byte-identical groups, and files no loaded file names
      // and no opened screen loaded; built-up names (an app id or a state in the path) still reach some of them.
      const inv = inventory(v), idle = inv.unnamed.filter(f => !r.loaded.has(f));
      out.push('', `Inventory: ${inv.files} files, ${r.loaded.size} loaded on the opened screens; ${inv.duplicates.length} byte-identical groups (${(inv.extra / 1024).toFixed(0)} KiB over one copy each); ${idle.length} files neither named literally nor loaded (to review: deeper screens, states and dialogs reach many of them).`, '');
      out.push('<details><summary>Byte-identical groups</summary>', '', ...inv.duplicates.map(g => `- ${g.join(', ')}`), '', '</details>', '');
    } else console.log(v, s.missing.length, 'static');
    out.push('');
  }
  if (!picked.length && !staticOnly) fs.writeFileSync(path.join(ROOT, 'docs', 'reports', 'asset-check.md'), out.join('\n') + '\n');
  else console.log(out.join('\n'));
  if (problems) process.exitCode = 1;
}
