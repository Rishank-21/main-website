/* ---------------------------------------------------------------------------
   Hero motion layer — the libraries Mistral itself ships: Motion (the vanilla
   sibling of Framer Motion) for the timeline, Three.js for the WebGL depth
   field. Everything here is progressive enhancement: the CSS leaves every
   element in its finished state, so if these CDNs are unreachable the hero
   still reads exactly as designed.
   ------------------------------------------------------------------------- */
import { animate, inView, scroll, stagger } from 'https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FLAME = [0xffaf01, 0xff8204, 0xff5229, 0xe51300];

/* --------------------------------------------------------------------------
   1. Per-character roll on the display line
   -------------------------------------------------------------------------- */
function splitIntoChars(title) {
    const lines = [];
    let line = [];

    const pushWord = (text, accent) => {
        text.split(/\s+/).filter(Boolean).forEach(word => {
            const wrap = document.createElement('span');
            wrap.className = 'hero-word' + (accent ? ' hero-accent' : '');
            [...word].forEach(ch => {
                const c = document.createElement('span');
                c.className = 'hero-char';
                c.textContent = ch;
                wrap.appendChild(c);
            });
            line.push(wrap);
            line.push(document.createTextNode(' '));
        });
    };

    title.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            pushWord(node.textContent, false);
        } else if (node.nodeName === 'BR') {
            if (line.length) lines.push(line);
            line = [];
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            pushWord(node.textContent, node.classList.contains('hero-accent'));
        }
    });
    if (line.length) lines.push(line);

    title.textContent = '';
    lines.forEach(tokens => {
        const row = document.createElement('span');
        row.className = 'hero-line';
        tokens.forEach(t => row.appendChild(t));
        title.appendChild(row);
    });

    return [...title.querySelectorAll('.hero-char')];
}

function initHeroTitle() {
    const title = document.querySelector('.hero-title');
    if (!title) return () => {};
    const chars = splitIntoChars(title);
    return () => {
        if (REDUCED || !chars.length) return;
        animate(chars, { y: ['115%', '0%'] }, {
            duration: .92,
            delay: stagger(.026, { start: .12 }),
            easing: [.45, .05, .15, 1]
        });
    };
}

/* --------------------------------------------------------------------------
   2. Flame tiles growing out of the hairline rules + dot fades
   -------------------------------------------------------------------------- */
function initHeroField() {
    const tiles = [...document.querySelectorAll('.hero-tile')];
    const dots = [...document.querySelectorAll('.hero-dot')];
    if (!tiles.length) return () => {};

    const targets = tiles.map(t => getComputedStyle(t).width);

    return () => {
        if (REDUCED) return;
        tiles.forEach((t, i) => {
            t.style.width = '0px';
            animate(t, { width: ['0px', targets[i]] }, {
                duration: 1.05,
                delay: .35 + i * .11,
                easing: [.19, 1, .22, 1]
            });
        });
        animate(dots, { opacity: [0, 1] }, { duration: .5, delay: stagger(.09, { start: .5 }) });
        animate('.hero-ring', { opacity: [0, 1], scale: [.96, 1] }, {
            duration: 1.4, easing: [.19, 1, .22, 1]
        });
    };
}

/* --------------------------------------------------------------------------
   3. Pointer parallax across the whole field
   -------------------------------------------------------------------------- */
function initPointerParallax() {
    if (REDUCED) return;
    const hero = document.querySelector('.hero');
    const frame = document.querySelector('.hero-frame');
    const field = document.querySelector('.hero-field');
    if (!hero || !frame || !field) return;

    let tx = 0, ty = 0, cx = 0, cy = 0;

    hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - .5;
        ty = (e.clientY - r.top) / r.height - .5;
    });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; });

    (function tick() {
        cx += (tx - cx) * .06;
        cy += (ty - cy) * .06;
        field.style.transform = `translate3d(${cx * -26}px, ${cy * -16}px, 0)`;
        frame.style.transform = `translate3d(${cx * 9}px, ${cy * 6}px, 0)`;
        requestAnimationFrame(tick);
    })();
}

/* --------------------------------------------------------------------------
   4. Three.js depth field — extruded flame tiles floating behind the copy
   -------------------------------------------------------------------------- */
function roundedRect(w, h, r) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return s;
}

function initHero3D() {
    const canvas = document.getElementById('heroCanvas');
    const hero = document.querySelector('.hero');
    if (!canvas || !hero || REDUCED) return;

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch (err) {
        return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, .1, 100);
    camera.position.z = 12;

    scene.add(new THREE.AmbientLight(0xffffff, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(4, 6, 9);
    scene.add(key);

    const tiles = [];
    const layout = [
        [-7.4, 2.9, 1.9], [7.2, -2.4, 2.1], [-5.6, -3.4, 1.3],
        [5.9, 3.4, 1.5], [-8.2, -.6, 1.0], [8.4, .8, 1.1],
        [-3.9, 4.2, .85], [3.7, -4.6, .95]
    ];

    layout.forEach((p, i) => {
        const size = .9 + (i % 3) * .34;
        const geo = new THREE.ExtrudeGeometry(roundedRect(size, size, size * .17), {
            depth: .18, bevelEnabled: true, bevelSize: .035, bevelThickness: .035, bevelSegments: 2
        });
        const mat = new THREE.MeshStandardMaterial({
            color: FLAME[i % FLAME.length],
            roughness: .42,
            metalness: .05,
            transparent: true,
            opacity: .9
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(p[0], p[1], p[2]);
        mesh.userData = { base: [...p], spin: (i % 2 ? -1 : 1) * (.12 + i * .014), bob: i * 1.7 };
        scene.add(mesh);
        tiles.push(mesh);
    });

    const ringGeo = new THREE.TorusGeometry(5.6, .012, 3, 128);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xd8d7d2, transparent: true, opacity: .55 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 0, -3);
    scene.add(ring);

    let px = 0, py = 0, cpx = 0, cpy = 0, drift = 0;
    hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect();
        px = (e.clientX - r.left) / r.width - .5;
        py = (e.clientY - r.top) / r.height - .5;
    });

    const resize = () => {
        const r = hero.getBoundingClientRect();
        const w = Math.max(1, Math.round(r.width));
        const h = Math.max(1, Math.round(r.height));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    let visible = true;
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
            visible = entries.some(e => e.isIntersecting);
        }, { threshold: 0 }).observe(hero);
    }

    const clock = new THREE.Clock();
    (function loop() {
        requestAnimationFrame(loop);
        if (!visible) return;

        const t = clock.getElapsedTime();
        cpx += (px - cpx) * .05;
        cpy += (py - cpy) * .05;
        drift = window.scrollY * .0016;

        camera.position.x = cpx * 1.9;
        camera.position.y = -cpy * 1.3 - drift;
        camera.lookAt(0, -drift * .6, 0);

        tiles.forEach(m => {
            const d = m.userData;
            m.rotation.x = Math.sin(t * .34 + d.bob) * .34 + cpy * .5;
            m.rotation.y = t * d.spin * .5 + cpx * .7;
            m.position.y = d.base[1] + Math.sin(t * .5 + d.bob) * .26;
            m.position.x = d.base[0] + cpx * .5;
        });
        ring.rotation.x = .34 + cpy * .3;
        ring.rotation.y = cpx * .4;

        renderer.render(scene, camera);
    })();

    requestAnimationFrame(() => canvas.classList.add('is-live'));
}

/* --------------------------------------------------------------------------
   Boot
   -------------------------------------------------------------------------- */
const playTitle = initHeroTitle();
const playField = initHeroField();

if ('IntersectionObserver' in window && 'animate' in window === false) {
    // no-op; motion is imported, not global
}

inView('.hero', () => {
    playTitle();
    playField();
}).filter(() => true);

initPointerParallax();
initHero3D();
