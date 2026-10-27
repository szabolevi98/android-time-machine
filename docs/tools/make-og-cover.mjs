// Renders English og-cover.jpg and Hungarian og-cover-hu.jpg (1200 x 630) from the same source; no npm packages/server.
//   node docs/tools/make-og-cover.mjs            (set CHROME=/path/to/chrome if Chrome is not found)
//   node docs/tools/make-og-cover.mjs --portfolio <out.png>   the levente.net portfolio card instead: docs/tools/portfolio-cover.html,
//                                                       1200 x 720 at 4/3 device pixels = 1600 x 960 PNG
//   node docs/tools/make-og-cover.mjs --portfolio-thumb <out.png>   the same page laid out for the card's small picture
//                                                       (portfolio web/assets/img/projects/thumbs/android-simulator.png)
// After artwork changes, bump the image revision in make-social-meta.mjs and regenerate the static metadata.
import {spawn} from 'node:child_process';
import {existsSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const thumb = process.argv.indexOf('--portfolio-thumb');
const portfolio = thumb > 0 ? thumb : process.argv.indexOf('--portfolio');
const [page, output, width, height, scale] = portfolio > 0
  ? ['portfolio-cover.html', resolve(process.argv[portfolio + 1]), 1200, 720, 4 / 3]
  : ['og-cover.html', join(root, 'assets', 'og-cover.jpg'), 1200, 630, 1];
const source = pathToFileURL(join(root, 'docs', 'tools', page)).href + (thumb > 0 ? '#thumb' : '');
const jobs = portfolio > 0 ? [{source, output}] : ['en', 'hu'].map(lang => ({
  source: `${source}?lang=${lang}`, output: join(root, 'assets', lang === 'en' ? 'og-cover.jpg' : 'og-cover-hu.jpg')
}));
const candidates = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean);
const chromePath = candidates.find(path => existsSync(path));
if (!chromePath) { console.error('Chrome not found; set CHROME to its path.'); process.exit(1); }

const wait = ms => new Promise(done => setTimeout(done, ms));
const profile = mkdtempSync(join(tmpdir(), 'og-cover-'));
const port = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn(chromePath, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', '--hide-scrollbars',
  '--allow-file-access-from-files', `--window-size=${width},${height}`, 'about:blank'], {stdio: 'ignore'});
try {
  let target;
  for (let i = 0; i < 60 && !target; i++) { try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(item => item.type === 'page'); } catch { await wait(200); } }
  if (!target) throw new Error('Chrome did not start.');
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(done => socket.addEventListener('open', done));
  let id = 0; const pending = new Map();
  socket.addEventListener('message', event => { const message = JSON.parse(event.data); pending.get(message.id)?.(message); pending.delete(message.id); });
  const send = (method, params = {}) => new Promise(done => { const n = ++id; pending.set(n, done); socket.send(JSON.stringify({id: n, method, params})); });
  await send('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor: 1, mobile: false});
  for (const job of jobs) {
    await send('Page.navigate', {url: job.source});
    let pageReady = false;
    for (let i = 0; i < 80 && !pageReady; i++) {
      await wait(100);
      const r = await send('Runtime.evaluate', {expression: `location.href===${JSON.stringify(job.source)}&&document.readyState==='complete'&&!!document.querySelector('.phone')`, returnByValue: true});
      pageReady = !!r.result?.result?.value;
    }
    if (!pageReady) throw new Error(`Cover source did not finish loading: ${job.source}`);
    // Wait until the fonts and every picture of the page have loaded.
    const ready = `(async () => { await document.fonts.ready; await Promise.all([...document.images].map(img => img.decode()));
      await Promise.all([...document.querySelectorAll('.shot')].map(async el => {const img=new Image();img.src=getComputedStyle(el).backgroundImage.slice(5,-2);await img.decode();})); return document.images.length; })()`;
    const loaded = await send('Runtime.evaluate', {expression: ready, awaitPromise: true, returnByValue: true});
    if (loaded.result?.exceptionDetails) throw new Error(JSON.stringify(loaded.result.exceptionDetails));
    await wait(300);
    const shot = await send('Page.captureScreenshot', {...(portfolio > 0 ? {format: 'png'} : {format: 'jpeg', quality: 88}), clip: {x: 0, y: 0, width, height, scale}});
    writeFileSync(job.output, Buffer.from(shot.result.data, 'base64'));
    console.log(`${job.output} written (${loaded.result?.result?.value ?? '?'} pictures).`);
  }
  socket.close();
} finally {
  chrome.kill(); await wait(400);
  try { rmSync(profile, {recursive: true, force: true}); } catch {}
}
