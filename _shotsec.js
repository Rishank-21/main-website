/* Section screenshot: node _shotsec.js <selector> <width> <outName>
   Captures the element's own box (full width, capped height). */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const SEL = process.argv[2] || '.services-section';
const W = parseInt(process.argv[3] || '1440', 10);
const NAME = process.argv[4] || 'sec';
const H = parseInt(process.argv[5] || '0', 10);
const URL = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');
const PORT = 9346;
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${path.join(os.tmpdir(), 'bstate-audit', '_p4')}`,
    '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--no-first-run', 'about:blank'
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
  const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true }); return r.result.value; };

  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: 900, deviceScaleFactor: 1, mobile: W < 500 });
  await send('Page.navigate', { url: URL });
  await sleep(2600);
  await ev(`(() => { document.querySelectorAll('.reveal-on-scroll,.service-row,.pillar-card,.process-step-item,.quote-card,.why-card,.eco-node,.work-card,.ecosystem-container,.doodle,.hero-kicker,.hero-headline,.hero-lead,.hero-actions,.strings-stage').forEach(e=>e.classList.add('is-visible','is-live','drawn','split-done','pop')); return 1; })()`);
  await sleep(700);
  const rect = await ev(`(() => { const el=document.querySelector(${JSON.stringify(SEL)}); if(!el) return 'null'; const r=el.getBoundingClientRect(); return JSON.stringify({x:0, y:Math.max(0, Math.round(r.top+window.scrollY)), width:window.innerWidth, height:Math.min(Math.round(r.height), 3000), scale:1}); })()`);
  if (rect === 'null') { console.log('selector not found'); }
  else {
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: JSON.parse(rect) });
    const file = path.join(os.tmpdir(), 'bstate-audit', NAME + '.png');
    fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
    console.log(file, rect);
  }
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
