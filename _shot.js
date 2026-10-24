/* One-off region screenshot: node _shot.js <selector> <width> <outName> */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const SEL = process.argv[2] || '.contact-headline';
const W = parseInt(process.argv[3] || '1440', 10);
const NAME = process.argv[4] || 'shot';
const URL = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');
const PORT = 9344;
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${path.join(os.tmpdir(), 'bstate-audit', '_p2')}`,
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
  await sleep(2500);
  await ev(`(() => { document.querySelectorAll('.reveal-on-scroll,.service-row,.pillar-card,.process-step-item,.quote-card,.why-card,.eco-node,.work-card,.ecosystem-container').forEach(e=>e.classList.add('is-visible','is-live','drawn','split-done')); return 1; })()`);
  await sleep(300);
  await ev(`(() => { const el=document.querySelector(${JSON.stringify(SEL)}); if(el) el.scrollIntoView({block:'center'}); return 1; })()`);
  await sleep(1200);
  const rect = JSON.parse(await ev(`(() => { const el=document.querySelector(${JSON.stringify(SEL)}); if(!el) return 'null'; const r=el.getBoundingClientRect(); return JSON.stringify({x:Math.round(r.left+window.scrollX)-24,y:Math.round(r.top+window.scrollY)-24,w:Math.round(r.width)+48,h:Math.round(r.height)+48}); })()`));
  if (rect === 'null') { console.log('selector not found'); }
  else {
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: Math.max(0, rect.x), y: rect.y, width: rect.w, height: Math.min(rect.h, 1600), scale: 1 } });
    const file = path.join(os.tmpdir(), 'bstate-audit', NAME + '.png');
    fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
    console.log(file, JSON.stringify(rect));
  }
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
