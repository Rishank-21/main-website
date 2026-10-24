/* node _probe.js <width> "<js expression returning string>" */
const path = require('path');
const { spawn } = require('child_process');
const W = parseInt(process.argv[2] || '390', 10);
const EXPR = process.argv[3];
const URL = process.env.PROBE_URL || ('file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/'));
const PORT = 9355;
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${path.join(__dirname, '_audit', '_p3')}`,
    '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--no-first-run', 'about:blank'
  ], { stdio: 'ignore' });
  let meta = null;
  for (let i = 0; i < 80; i++) {
    try { meta = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page'); if (meta) break; } catch (e) {}
    await sleep(250);
  }
  const ws = new WebSocket(meta.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(); const logs = [];
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); } else if (m.method === 'Runtime.consoleAPICalled') { logs.push(m.params.type + ': ' + m.params.args.map(a => a.value ?? a.description ?? '').join(' ')); } else if (m.method === 'Runtime.exceptionThrown') { logs.push('EXC: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text)); } };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const mid = ++id; pending.set(mid, { resolve, reject }); ws.send(JSON.stringify({ id: mid, method, params })); });
  const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) return 'EVAL_ERR ' + (r.exceptionDetails.exception?.description || ''); return r.result.value; };
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: 844, deviceScaleFactor: 1, mobile: W < 500 });
  await send('Page.navigate', { url: URL });
  await sleep(2600);
  console.log(await ev(EXPR));
  if (logs.length) console.log('--- logs ---\n' + [...new Set(logs)].join('\n'));
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
