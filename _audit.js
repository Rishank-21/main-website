/* Multi-device audit harness: drives headless Chrome over CDP. */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.join(os.tmpdir(), 'bstate-audit');
const URL = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');
const PORT = 9333;

const TARGETS = [
  { name: 'desktop', width: 1440, height: 900, mobile: false },
  { name: 'tablet', width: 834, height: 1112, mobile: true },
  { name: 'mobile', width: 390, height: 844, mobile: true }
];

const SECTIONS = [
  ['hero', '.hero'], ['clients', '#clients'], ['about', '#about'], ['marquee', '.statement-marquee'],
  ['pillars', '#pillars'], ['services', '#services'], ['work', '#work'], ['process', '#process'],
  ['quotation', '#quotation'], ['why', '#why-us'], ['ecosystem', '.ecosystem-section'],
  ['faq', '#faq'], ['contact', '#contact'], ['footer', '.footer']
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${path.join(OUT, '_profile')}`,
    '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--no-first-run', '--disable-extensions', '--allow-file-access-from-files', 'about:blank'
  ], { stdio: 'ignore' });

  let meta = null;
  for (let i = 0; i < 80; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      meta = list.find(t => t.type === 'page');
      if (meta) break;
    } catch (e) { /* booting */ }
    await sleep(250);
  }
  if (!meta) { console.error('NO_DEVTOOLS'); chrome.kill(); process.exit(1); }

  const ws = new WebSocket(meta.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let id = 0, loadFired = false;
  const pending = new Map();
  const logs = [];
  ws.onmessage = ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id); pending.delete(msg.id);
      msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result);
    } else if (msg.method === 'Runtime.consoleAPICalled' && (msg.params.type === 'error' || msg.params.type === 'warning')) {
      logs.push(`[console.${msg.params.type}] ` + msg.params.args.map(a => a.value ?? a.description ?? '').join(' '));
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      logs.push(`[exception] ` + (d.exception?.description || d.text) + ' :: ' + (d.url || '').split('/').pop() + ':' + d.lineNumber);
    } else if (msg.method === 'Log.entryAdded') {
      const e = msg.params.entry;
      if (e.level === 'error' || e.level === 'warning') logs.push(`[${e.level}] ${e.text} @${(e.url || '').split('/').pop()}`);
    } else if (msg.method === 'Page.loadEventFired') { loadFired = true; }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const mid = ++id; pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  const ev = async expression => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval failed');
    return r.result.value;
  };

  await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
  const report = {};

  for (const t of TARGETS) {
    await send('Emulation.setDeviceMetricsOverride', { width: t.width, height: t.height, deviceScaleFactor: 1, mobile: t.mobile });
    loadFired = false;
    await send('Page.navigate', { url: URL });
    for (let i = 0; i < 50 && !loadFired; i++) await sleep(100);
    await sleep(3500);

    // Force every scroll-triggered reveal so screenshots show final state.
    await ev(`(() => {
      document.querySelectorAll('.reveal-on-scroll, .service-row, .pillar-card, .process-step-item, .quote-card, .why-card, .eco-node, .work-card, .ecosystem-container, .statement-marquee').forEach(el => { el.classList.add('is-visible','is-live','drawn','split-done'); });
      document.querySelectorAll('.doodle').forEach(d => d.classList.add('drawn'));
      document.querySelectorAll('.has-split').forEach(h => h.classList.add('split-done'));
      return 'ok';
    })()`);
    await sleep(1400);

    const m = JSON.parse(await ev(`(() => { const d=document.documentElement; return JSON.stringify({h:d.scrollHeight,w:d.clientWidth,overflowX:d.scrollWidth>d.clientWidth,sw:d.scrollWidth}); })()`));
    const info = { ...m, checks: JSON.parse(await ev(`(() => {
      const out={offenders:[],tapSmall:[],overlap:[],textClip:[],emptyText:0};
      const W=document.documentElement.clientWidth;
      const fixedTouched=[];
      document.querySelectorAll('body *').forEach(el=>{
        const cs=getComputedStyle(el);
        if(cs.display==='none'||cs.visibility==='hidden') return;
        const r=el.getBoundingClientRect();
        if(!r.width||!r.height) return;
        if(cs.position==='fixed'){ fixedTouched.push({cls:(el.className||'').toString().slice(0,30),rect:[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]}); }
        if(r.right>W+3||r.left<-3) out.offenders.push(((el.className||el.tagName).toString().slice(0,36))+' ['+Math.round(r.left)+'..'+Math.round(r.right)+']');
        if((el.tagName==='A'||el.tagName==='BUTTON')&&(r.height<34||r.width<28)) out.tapSmall.push(el.tagName+' "'+el.textContent.trim().slice(0,18)+'" '+Math.round(r.width)+'x'+Math.round(r.height));
        if(el.scrollWidth>el.clientWidth+6 && cs.overflowX!=='auto' && cs.overflowX!=='hidden' && cs.whiteSpace!=='nowrap' && el.children.length===0) out.textClip.push((el.className||el.tagName).toString().slice(0,30)+' '+el.scrollWidth+'>'+el.clientWidth);
        if((el.tagName==='P'||el.tagName==='H2'||el.tagName==='H3') && !el.textContent.trim()) out.emptyText++;
      });
      // fixed-action overlap test
      for(let i=0;i<fixedTouched.length;i++)for(let j=i+1;j<fixedTouched.length;j++){
        const a=fixedTouched[i].rect,b=fixedTouched[j].rect;
        if(a[0]<b[2]&&b[0]<a[2]&&a[1]<b[3]&&b[1]<a[3]) out.overlap.push(fixedTouched[i].cls+' x '+fixedTouched[j].cls);
      }
      out.fixedList=fixedTouched;
      out.offenders=[...new Set(out.offenders)].slice(0,14);
      out.tapSmall=[...new Set(out.tapSmall)].slice(0,14);
      out.textClip=[...new Set(out.textClip)].slice(0,14);
      const grid=(sel)=>{const e=document.querySelector(sel);return e?getComputedStyle(e).gridTemplateColumns:'MISSING:'+sel;};
      out.grids={hero:grid('.hero-grid'),work:grid('.work-grid'),process:grid('.process-timeline'),
        pillars:grid('.pillars-grid'),quote:grid('.web-quote-grid'),why:grid('.why-grid'),
        serviceRow:grid('.service-row'),ecoNodes:grid('.ecosystem-satellite-nodes'),tabs:grid('.service-tabs'),
        features:grid('.service-feature-grid')};
      out.nav={links:getComputedStyle(document.querySelector('.nav-links')||document.body).display, mobileBtn:document.querySelector('.mobile-menu-btn')?getComputedStyle(document.querySelector('.mobile-menu-btn')).display:'none', cta:document.querySelector('.nav-cta-btn')?getComputedStyle(document.querySelector('.nav-cta-btn')).display:null};
      out.eco={lines:document.querySelectorAll('.eco-links line').length, live:document.querySelector('.ecosystem-container')?document.querySelector('.ecosystem-container').classList.contains('is-live'):null, ringW:document.querySelector('.eco-ring-2')?document.querySelector('.eco-ring-2').getBoundingClientRect().width:null};
      out.dividerSvgH=document.querySelector('.section-divider svg')?getComputedStyle(document.querySelector('.section-divider svg')).height:null;
      out.splits=!!document.querySelector('.split-done, .has-split');
      out.doodles=[...document.querySelectorAll('.doodle')].filter(d=>{const r=d.getBoundingClientRect();return r.width>0&&r.height>0;}).length;
      out.sectionHeights={}; ${JSON.stringify(SECTIONS)}.forEach(([label,sel])=>{const e=document.querySelector(sel); if(e) out.sectionHeights[label]=Math.round(e.getBoundingClientRect().height);});
      out.tabsDisplay=document.querySelector('.service-tabs')?getComputedStyle(document.querySelector('.service-tabs')).display:null;
      out.rowCount=document.querySelectorAll('.service-row').length;
      out.rowOpacity=[...document.querySelectorAll('.service-row')].map(r=>getComputedStyle(r).opacity);
      return JSON.stringify(out); })()`)), shots: [] };

    await send('Page.captureScreenshot', { format: 'png' }).then(async s => {
      fs.writeFileSync(path.join(OUT, `${t.name}_00_fold.png`), Buffer.from(s.data, 'base64'));
      info.shots.push(`${t.name}_00_fold.png`);
    });

    for (const [label, sel] of SECTIONS) {
      const rectJson = await ev(`(() => { const el=document.querySelector(${JSON.stringify(sel)}); if(!el) return 'null';
        el.scrollIntoView({block:'start',behavior:'instant'}); const r=el.getBoundingClientRect();
        return JSON.stringify({x:Math.round(r.left),y:Math.round(r.top)+window.scrollY,w:Math.round(r.width),h:Math.round(r.height)}); })()`);
      if (rectJson === 'null') continue;
      const r = JSON.parse(rectJson);
      await sleep(650);
      const clips = [];
      const maxH = 1500;
      for (let y = 0; y < r.h; y += maxH) clips.push({ x: Math.max(0, r.x), y: r.y + y, width: r.w, height: Math.min(maxH, r.h - y), scale: 1 });
      for (let ci = 0; ci < clips.length; ci++) {
        const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: clips[ci] });
        const file = `${t.name}_${label}${clips.length > 1 ? '_' + ci : ''}.png`;
        fs.writeFileSync(path.join(OUT, file), Buffer.from(shot.data, 'base64'));
        info.shots.push(file);
      }
    }
    report[t.name] = info;
  }

  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
  console.log('--- CONSOLE/NETWORK LOGS ---');
  console.log([...new Set(logs)].join('\n') || '(clean)');
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e => { console.error('HARNESS_FAIL', e); process.exit(1); });
