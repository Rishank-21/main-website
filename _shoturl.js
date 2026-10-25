/* node _shoturl.js <url> <outfile> [waitMs] [width] [height] — screenshot a URL */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const URL_IN = process.argv[2];
const OUT = process.argv[3];
const WAIT = parseInt(process.argv[4] || '7000', 10);
const W = parseInt(process.argv[5] || '1440', 10);
const H = parseInt(process.argv[6] || '900', 10);
const PORT = 9360;
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${path.join(__dirname, '_audit', '_purl')}`,
    '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--no-first-run', '--mute-audio', 'about:blank'
  ], { stdio: 'ignore' });
  let meta = null;
  for (let i = 0; i < 80; i++) {
    try { meta = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page'); if (meta) break; } catch (e) {}
    await sleep(250);
  }
  const ws = new WebSocket(meta.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); } };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const mid = ++id; pending.set(mid, { resolve, reject }); ws.send(JSON.stringify({ id: mid, method, params })); });
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: URL_IN });
  await sleep(WAIT);
  // scroll through the page to trigger lazy loads, then back to top
  await send('Runtime.evaluate', { expression: `(async()=>{const h=document.body.scrollHeight;for(let y=0;y<h;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}window.scrollTo(0,0);})()`, awaitPromise: true });
  await sleep(2500);
  const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 82, captureBeyondViewport: false });
  fs.writeFileSync(OUT, Buffer.from(shot.data, 'base64'));
  console.log(OUT, fs.statSync(OUT).size, 'bytes');
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
