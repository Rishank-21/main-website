    let audioCtx = null;
    let audioEnabled = true;
    function getAudioCtx() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      return audioCtx;
    }

    function playCartoonSound(type) {
      if (!audioEnabled) return;
      try {
        const ctx = getAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;

        if (type === 'funny_boing') {
          const osc = ctx.createOscillator();
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(280, now);
          osc.frequency.exponentialRampToValueAtTime(680, now + 0.16);
          osc.frequency.exponentialRampToValueAtTime(420, now + 0.42);

          lfo.frequency.setValueAtTime(32, now);
          lfoGain.gain.setValueAtTime(75, now);
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);

          gain.gain.setValueAtTime(0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          lfo.start(now);
          osc.stop(now + 0.45);
          lfo.stop(now + 0.45);

        } else if (type === 'slap_pataak') {
          const bufferSize = Math.floor(ctx.sampleRate * 0.11);
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.022));
          }
          const whiteNoise = ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;

          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1850, now);

          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.32, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.11);

          whiteNoise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(ctx.destination);
          whiteNoise.start(now);

          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(840, now + 0.04);
          osc.frequency.exponentialRampToValueAtTime(210, now + 0.42);
          oscGain.gain.setValueAtTime(0.12, now + 0.04);
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.44);
          osc.connect(oscGain);
          oscGain.connect(ctx.destination);
          osc.start(now + 0.04);
          osc.stop(now + 0.44);

        } else if (type === 'sad_walk') {
          const notes = [330, 311.13, 293.66, 261.63];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            const startT = now + idx * 0.24;
            const dur = idx === 3 ? 0.52 : 0.20;
            osc.frequency.setValueAtTime(freq, startT);
            if (idx === 3) {
              osc.frequency.linearRampToValueAtTime(freq - 24, startT + dur);
            }
            gain.gain.setValueAtTime(0.055, startT);
            gain.gain.exponentialRampToValueAtTime(0.001, startT + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startT);
            osc.stop(startT + dur);
          });

        } else if (type === 'cheer_up') {
          [523.25, 659.25].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const st = now + idx * 0.11;
            osc.frequency.setValueAtTime(freq, st);
            gain.gain.setValueAtTime(0.075, st);
            gain.gain.exponentialRampToValueAtTime(0.001, st + 0.24);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(st);
            osc.stop(st + 0.24);
          });

        } else if (type === 'claw_servo') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.linearRampToValueAtTime(95, now + 0.55);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.58);

        } else if (type === 'claw_clamp_scream') {
          // Metallic clamp clank + cute panic warble ("Oye bachaao mujhe!!")
          [480, 740, 620, 880, 590, 860].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const st = now + idx * 0.085;
            osc.frequency.setValueAtTime(freq, st);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.15, st + 0.07);
            gain.gain.setValueAtTime(0.08, st);
            gain.gain.exponentialRampToValueAtTime(0.001, st + 0.085);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(st);
            osc.stop(st + 0.09);
          });

        } else if (type === 'scared_flee') {
          // Rapid cartoon bongo/scurry notes when p2 gets scared and runs away
          [390, 520, 440, 620, 490, 680].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            const st = now + idx * 0.065;
            osc.frequency.setValueAtTime(freq, st);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.25, st + 0.055);
            gain.gain.setValueAtTime(0.075, st);
            gain.gain.exponentialRampToValueAtTime(0.001, st + 0.06);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(st);
            osc.stop(st + 0.062);
          });

        } else if (type === 'claw_drop_whistle') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(780, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.42);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.44);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.44);
        }
      } catch (err) {
        // Ignore audio context errors when blocked by autoplay rules
      }
    }

    // ============================================================================
    // 1. 4 SMALL, ULTRA-DETAILED 3D VELVET PLUSH PET CONFIGURATIONS (`CHAR_SCALE = 0.36`)
    // ============================================================================
    const MASCOT_CONFIGS = [
      {
        id: 0,
        key: 'software',
        species: 'purple_kitty',
        name: 'Violet Kitty',
        bodyColor: 0x7b2cbf,       // Rich purple flocked velvet
        emissiveRim: 0x2a0845,
        deepShadowColor: 0x310866,
        bellyColor: 0xf3e5ff,      // Soft pastel lavender belly & peanut snout
        pawPadColor: 0xff85a1,     // Glossy pink toe-bean paw pads
        collarColor: 0xff4d6d,     // Rose collar with golden bell
        innerEarColor: 0xf783ac,
        initialSlot: 0,
        badge: 'SERVICE 01',
        lines: ['Custom Software', 'Development'],
        markerAccent: '#7b2cbf',
        idleThoughts: ['Code compile ho gaya! 💻✨', 'Click me! 🐾', 'Zero Bugs! ⚡', 'AI & Cloud! 🚀']
      },
      {
        id: 1,
        key: 'website',
        species: 'pink_bunny',
        name: 'Magenta Bunny',
        bodyColor: 0xe5178f,       // Vibrant hot-pink flocked velvet
        emissiveRim: 0x4a042d,
        deepShadowColor: 0x730643,
        bellyColor: 0xffe5f1,      // Blush cream belly & snout
        pawPadColor: 0xffb3c6,     // Baby pink paw pads
        collarColor: 0x7209b7,     // Violet collar with golden bell
        innerEarColor: 0xff85a1,
        initialSlot: 1,
        badge: 'SERVICE 02',
        lines: ['Website', 'Development'],
        markerAccent: '#e5178f',
        idleThoughts: ['Top Websites! 🎨✨', 'Super Fast UI! ⚡', 'Click me! 🐰', 'Pixel Perfect! 💎']
      },
      {
        id: 2,
        key: 'marketing',
        species: 'coral_puppy',
        name: 'Coral Puppy',
        bodyColor: 0xff5d73,       // Warm coral-rose flocked velvet
        emissiveRim: 0x4d0b16,
        deepShadowColor: 0x8f0d26,
        bellyColor: 0xfff0f3,      // Cream belly patch & muzzle puffs
        pawPadColor: 0xffccd5,     // Soft rose paw pads
        collarColor: 0x2b9348,     // Emerald collar with golden bell
        innerEarColor: 0xff8fa3,
        initialSlot: 2,
        badge: 'SERVICE 03',
        lines: ['Performance', 'Marketing'],
        markerAccent: '#e63946',
        idleThoughts: ['10x Ads ROI! 🚀🔥', 'Viral Leads! 📈', 'Click me! 🐶', 'High ROAS! 🎯']
      },
      {
        id: 3,
        key: 'seo',
        species: 'minty_cub',
        name: 'Minty Cub',
        bodyColor: 0x40916c,       // Fresh mint-emerald flocked velvet
        emissiveRim: 0x0b2e1e,
        deepShadowColor: 0x153b2a,
        bellyColor: 0xd8f3dc,      // Soft mint-cream snout & belly patch
        pawPadColor: 0xffb5a7,     // Cute peach-pink paw pads
        collarColor: 0xe63946,     // Coral red collar with golden bell
        innerEarColor: 0x95d5b2,
        initialSlot: 3,
        badge: 'SERVICE 04',
        lines: ['SEO', 'Optimization'],
        markerAccent: '#2d6a4f',
        idleThoughts: ['#1 on Google! 📈🏆', 'Organic Traffic! 🌱', 'Click me! 🐻', 'Top Rankings! ⭐']
      }
    ];

    const SLOT_DEFS = [
      { slotIndex: 0, topBlockId: 'block-1', stepBlockId: 'step-1', side: 'left', isHighStack: true },
      { slotIndex: 1, topBlockId: 'block-2', stepBlockId: 'step-2', side: 'left', isHighStack: false },
      { slotIndex: 2, topBlockId: 'block-3', stepBlockId: 'step-3', side: 'right', isHighStack: false },
      { slotIndex: 3, topBlockId: 'block-4', stepBlockId: 'step-4', side: 'right', isHighStack: true }
    ];

    let scene, camera, renderer;
    let clock = new THREE.Clock();
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2(0, 0);
    let smoothMouse = new THREE.Vector2(0, 0);

    let mascots = [];
    let interactiveMeshes = [];
    let slotPositions = [];
    let dustParticles = [];
    let velvetFurMaps = null;
    let shadowTexture = null;
    let flyingPosterGroup = null;
    let flyingPosterFaceMat = null;

    // ============================================================================
    // 1B. DYNAMIC EXTENDING TOP MECHANICAL CLAW HOOK CONTROLLER STATE
    // ============================================================================
    const clawState = {
      phase: 'PATROL',
      mode: 'POSTER_EXCHANGE',   // 'PET_KIDNAP' | 'POSTER_EXCHANGE'
      screenX: 380,
      startScreenX: 380,
      targetScreenX: 380,
      cableLength: 26,
      startCableLength: 26,
      targetCableLength: 26,
      prongOpenDeg: 14,          // 36 = wide open, 5 = clamped tight around pet/poster
      swayAngleDeg: 0,
      phaseTimer: 0,
      phaseDuration: 1.0,
      grabbedMascot: null,       // Pet A (kidnapped pet OR pet whose poster is stolen)
      displacedMascot: null,     // Pet B (scared pet OR pet whose poster is exchanged)
      originSlotIndex: 0,
      targetSlotIndex: 0,
      willRelocateToOtherBlock: true,
      noticeTriggered: false,
      displacedFleeTriggered: false,
      midScreamSwitched: false,
      stolenPosterConfigA: null,
      stolenPosterConfigB: null,
      grabCount: 0,
      autoModeToggle: 0,         // Alternates automatic hook between POSTER_EXCHANGE & PET_KIDNAP
      autoNextTime: 3            // First automatic hook action starts three seconds after load
    };

    function updateClawDOMElements() {
      const rigEl = document.getElementById('claw-rig');
      const cableEl = document.getElementById('claw-cable');
      const assemblyEl = document.getElementById('claw-assembly');
      const leftProngEl = document.getElementById('claw-prong-left');
      const rightProngEl = document.getElementById('claw-prong-right');
      const ledEl = document.getElementById('claw-status-led');

      if (!rigEl || !cableEl || !assemblyEl || !leftProngEl || !rightProngEl) return;

      rigEl.style.transform = `translate3d(${clawState.screenX.toFixed(1)}px, 0, 0)`;
      cableEl.style.height = `${Math.max(18, clawState.cableLength).toFixed(1)}px`;
      assemblyEl.style.transform = `rotate(${clawState.swayAngleDeg.toFixed(2)}deg)`;
      leftProngEl.style.transform = `rotate(${clawState.prongOpenDeg.toFixed(1)}deg)`;
      rightProngEl.style.transform = `rotate(${(-clawState.prongOpenDeg).toFixed(1)}deg)`;

      if (ledEl) {
        if (clawState.phase === 'PATROL') {
          ledEl.classList.remove('is-active');
        } else {
          ledEl.classList.add('is-active');
        }
      }
    }

    // ============================================================================
    // 2. ROCK-SOLID PROCEDURAL 512x512 MICRO-FUR BUMP & ROUGHNESS TEXTURE
    // ============================================================================
    function createMicroVelvetFurMaps() {
      const size = 512;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, size, size);

      for (let i = 0; i < 20000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const len = 3.0 + Math.random() * 5.0;
        const angle = (Math.random() - 0.5) * 0.45 + Math.PI * 0.5;
        const lum = Math.floor(95 + Math.random() * 145);

        ctx.strokeStyle = `rgb(${lum},${lum},${lum})`;
        ctx.lineWidth = 0.9 + Math.random() * 0.7;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
        ctx.stroke();
      }

      const bumpMap = new THREE.CanvasTexture(canvas);
      bumpMap.wrapS = THREE.RepeatWrapping;
      bumpMap.wrapT = THREE.RepeatWrapping;
      bumpMap.repeat.set(6, 6);

      const roughnessMap = new THREE.CanvasTexture(canvas);
      roughnessMap.wrapS = THREE.RepeatWrapping;
      roughnessMap.wrapT = THREE.RepeatWrapping;
      roughnessMap.repeat.set(6, 6);

      return { bumpMap, roughnessMap };
    }

    function createVelvetPlushMaterial(baseHex, emissiveHex) {
      return new THREE.MeshStandardMaterial({
        color: baseHex,
        emissive: emissiveHex || 0x11051c,
        emissiveIntensity: 0.18,
        roughness: 0.82,
        metalness: 0.03,
        bumpMap: velvetFurMaps ? velvetFurMaps.bumpMap : null,
        bumpScale: 0.035,
        roughnessMap: velvetFurMaps ? velvetFurMaps.roughnessMap : null
      });
    }

    function createSoftContactShadowTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
      grad.addColorStop(0, 'rgba(15, 23, 42, 0.42)');
      grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.16)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(canvas);
    }

    function drawRoundedRectPath(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    function setMascotThoughtBubble(mascot, text, style = 'normal', duration = 3.6) {
      if (!mascot || !mascot.userData) return;
      const d = mascot.userData;
      d.thoughtText = text;
      d.thoughtStyle = style;
      d.thoughtTimer = duration;

      const textEl = document.getElementById(`thought-text-${d.id}`);
      const cloudEl = document.getElementById(`thought-cloud-${d.id}`);
      if (textEl) textEl.textContent = text;
      if (cloudEl) {
        cloudEl.classList.remove('is-burst', 'is-scream', 'is-sad');
        if (style === 'burst') cloudEl.classList.add('is-burst');
        else if (style === 'scream') cloudEl.classList.add('is-scream');
        else if (style === 'sad') cloudEl.classList.add('is-sad');
      }
    }

    function updateDOMThoughtBubbles(delta) {
      if (!camera) return;
      const viewport = getHeroViewport();
      const halfW = viewport.width * 0.5;
      const halfH = viewport.height * 0.5;

      mascots.forEach((mascot) => {
        const d = mascot.userData;
        const wrapperEl = document.getElementById(`thought-bubble-${d.id}`);
        if (!wrapperEl) return;

        if (d.thoughtTimer > 0) {
          d.thoughtTimer -= delta;
        } else if (d.state === 'IDLE_ON_BLOCK' && !d.reservedByHook) {
          d.idleThoughtCooldown -= delta;
          if (d.idleThoughtCooldown <= 0) {
            d.idleThoughtCooldown = 5.0 + Math.random() * 4.5;
            d.idleThoughtIndex = (d.idleThoughtIndex + 1) % d.config.idleThoughts.length;
            setMascotThoughtBubble(mascot, d.config.idleThoughts[d.idleThoughtIndex], 'normal', 3.6);
          }
        }

        let localTopY = (d.posterScaleCurrent > 0.65 && d.boardVisible !== false) ? 3.55 : 2.35;
        if (d.state === 'CLAW_GRABBED' || d.state === 'CLAW_FALLING') {
          localTopY = 2.15;
        }

        const anchorWorld = new THREE.Vector3(0, localTopY * d.charScale, 0);
        anchorWorld.applyMatrix4(mascot.matrixWorld);
        anchorWorld.project(camera);

        let screenX = (anchorWorld.x * halfW) + halfW;
        let screenY = -(anchorWorld.y * halfH) + halfH;

        screenX = THREE.MathUtils.clamp(screenX, 90, viewport.width - 90);
        screenY = Math.max(82, screenY);

        const isOnScreen = screenY < viewport.height - 10;
        const shouldShow = isOnScreen && (
          d.thoughtTimer > 0 ||
          d.state === 'CLAW_GRABBED' ||
          d.state === 'CLAW_TARGETED' ||
          d.state === 'CLAW_FALLING' ||
          d.state === 'SCARED_BY_HOOK_DROP' ||
          d.state === 'POSTER_TARGETED_LOOK_UP' ||
          d.state === 'POSTER_STOLEN_TANTRUM' ||
          d.state === 'POSTER_SWAPPED_SHOCK' ||
          d.state !== 'SEQ_MOVING'
        );

        wrapperEl.style.transform = `translate(${screenX.toFixed(1)}px, ${screenY.toFixed(1)}px) translate(-50%, -100%)`;
        wrapperEl.style.opacity = shouldShow ? '1' : '0';
      });
    }

    // ============================================================================
    // 3. CLEAN WHITE MARKER POSTER BOARD TEXTURE (`1024x576` WITH `LinearFilter`)
    // ============================================================================
    const posterTextureCache = {};

    function getOrCreatePosterTexture(config) {
      if (posterTextureCache[config.key]) {
        return posterTextureCache[config.key];
      }
      const tex = drawCleanWhiteMarkerPosterTexture(config);
      posterTextureCache[config.key] = tex;
      return tex;
    }

    function setMascotPosterConfig(mascot, newConfig) {
      if (!mascot || !newConfig) return;
      const d = mascot.userData;
      d.heldPosterConfig = newConfig;
      d.posterFaceMat.map = getOrCreatePosterTexture(newConfig);
      d.posterFaceMat.needsUpdate = true;
    }

    function createFlyingClawPoster3D() {
      const group = new THREE.Group();
      const boardW = 3.10;
      const boardH = 1.78;
      const CHAR_SCALE = 0.36;

      const boardInner = new THREE.Group();
      boardInner.scale.setScalar(CHAR_SCALE);
      group.add(boardInner);

      const posterShadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(boardW * 1.01, boardH * 1.02),
        new THREE.MeshBasicMaterial({ color: 0x181820, transparent: true, opacity: 0.14 })
      );
      posterShadowPlane.position.set(0.06, -0.06, -0.04);
      boardInner.add(posterShadowPlane);

      const cardboardBacking = new THREE.Mesh(
        new THREE.BoxGeometry(boardW * 0.97, boardH * 0.94, 0.045),
        new THREE.MeshStandardMaterial({ color: 0xf4f1f6, roughness: 0.85 })
      );
      boardInner.add(cardboardBacking);

      flyingPosterFaceMat = new THREE.MeshBasicMaterial({
        map: getOrCreatePosterTexture(MASCOT_CONFIGS[0]),
        transparent: true
      });
      const posterFace = new THREE.Mesh(
        new THREE.PlaneGeometry(boardW, boardH),
        flyingPosterFaceMat
      );
      posterFace.position.z = 0.026;
      boardInner.add(posterFace);

      // Position boardInner so its top edge sits right inside the mechanical claw prongs
      boardInner.position.set(0, -boardH * 0.48 * CHAR_SCALE, 0.25);
      group.visible = false;
      return group;
    }

    function setFlyingPosterConfig(config) {
      if (!flyingPosterFaceMat || !config) return;
      flyingPosterFaceMat.map = getOrCreatePosterTexture(config);
      flyingPosterFaceMat.needsUpdate = true;
    }

    function drawCleanWhiteMarkerPosterTexture(config) {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 576;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      drawRoundedRectPath(ctx, 16, 16, 992, 544, 28);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.lineWidth = 5;
      ctx.strokeStyle = '#f1edf4';
      drawRoundedRectPath(ctx, 34, 34, 956, 508, 20);
      ctx.stroke();

      // Colored Service Pill Badge at top
      const pillW = 248;
      const pillH = 54;
      const pillX = (canvas.width - pillW) * 0.5;
      const pillY = 58;
      drawRoundedRectPath(ctx, pillX, pillY, pillW, pillH, 27);
      ctx.fillStyle = config.markerAccent;
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 25px "Plus Jakarta Sans", "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.badge, canvas.width * 0.5, pillY + pillH * 0.5 + 1);

      // Bold Clean Marker Text Lines
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const font1Size = config.lines[0].length > 12 ? 96 : 110;
      ctx.font = `700 ${font1Size}px "Fredoka", "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(config.lines[0], canvas.width * 0.5, 224);

      const font2Size = config.lines[1].length > 10 ? 94 : 106;
      ctx.font = `700 ${font2Size}px "Fredoka", "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(config.lines[1], canvas.width * 0.5, 356);

      // Hand-drawn Marker Underline Swoop
      ctx.strokeStyle = config.markerAccent;
      ctx.lineCap = 'round';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(190, 456);
      ctx.quadraticCurveTo(512, 434, 834, 456);
      ctx.stroke();

      ctx.fillStyle = config.markerAccent;
      ctx.beginPath();
      ctx.arc(162, 456, 8, 0, Math.PI * 2);
      ctx.arc(862, 456, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Crisp Dark Marker Border around White Sheet
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 9;
      drawRoundedRectPath(ctx, 16, 16, 992, 544, 28);
      ctx.stroke();

      const tex = new THREE.CanvasTexture(canvas);
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      if (renderer) {
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      }
      tex.needsUpdate = true;
      return tex;
    }

    // ============================================================================
    // 4. ORGANIC SCULPTED 3D VELVET PLUSH ANATOMY (`CHAR_SCALE = 0.36`)
    // ============================================================================
    function createSculptedPlushHeadGeometry() {
      const geo = new THREE.SphereGeometry(0.62, 56, 44);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);

        const cheekBulge = Math.exp(-Math.pow((y + 0.14) / 0.30, 2));
        x *= 1.11 + cheekBulge * 0.28;

        if (y > 0.18) {
          x *= 0.95;
          z *= 0.95;
        }

        if (z > 0.10 && y < 0.08 && y > -0.38) {
          z += cheekBulge * 0.11;
        }

        if (z > 0.25) {
          const distLeftEye = Math.hypot(x + 0.185, y + 0.025);
          const distRightEye = Math.hypot(x - 0.185, y + 0.025);
          if (distLeftEye < 0.20) {
            z -= Math.cos((distLeftEye / 0.20) * (Math.PI * 0.5)) * 0.068;
          }
          if (distRightEye < 0.20) {
            z -= Math.cos((distRightEye / 0.20) * (Math.PI * 0.5)) * 0.068;
          }
        }

        if (z < -0.15) {
          z *= 0.88;
        }

        pos.setXYZ(i, x, y, z);
      }
      geo.computeVertexNormals();
      return geo;
    }

    function createSculptedTorsoGeometry() {
      const geo = new THREE.SphereGeometry(0.47, 44, 34);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);

        const t = (y + 0.47) / 0.94;
        const waistProfile = 1.16 - t * 0.38;
        x *= waistProfile;
        z *= waistProfile * 0.95;
        y *= 1.18;

        if (z > 0 && t < 0.65) {
          z += Math.sin(t * Math.PI) * 0.055;
        }

        pos.setXYZ(i, x, y, z);
      }
      geo.computeVertexNormals();
      return geo;
    }

    function createSeamlessPlushLegGeometry(sideSign) {
      const geo = new THREE.CylinderGeometry(0.145, 0.26, 0.66, 40, 24);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);

        const t = (y + 0.33) / 0.66;
        const footFlare = Math.pow(1.0 - t, 1.50);

        if (z > 0) {
          z += footFlare * 0.18;
        }
        x *= 1.0 + footFlare * 0.20;
        x += sideSign * (1.0 - t) * 0.05;

        if (t < 0.15) {
          const edgeRound = Math.sin((t / 0.15) * (Math.PI * 0.5));
          x *= 0.88 + 0.12 * edgeRound;
          z *= 0.88 + 0.12 * edgeRound;
        }

        pos.setXYZ(i, x, y, z);
      }
      geo.translate(0, -0.26, 0.03);
      geo.computeVertexNormals();
      return geo;
    }

    function createSeamlessPlushArmGeometry() {
      const geo = new THREE.CylinderGeometry(0.16, 0.105, 0.68, 36, 20);
      geo.translate(0, 0.30, 0);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);
        const t = THREE.MathUtils.clamp(y / 0.64, 0, 1);

        const pawCurve = Math.sin(t * Math.PI);
        x *= 0.92 + pawCurve * 0.28;
        z *= 0.86 + pawCurve * 0.24;

        pos.setXYZ(i, x, y, z);
      }
      geo.computeVertexNormals();
      return geo;
    }

    function createSculptedBunnyEarGeometry(sideSign) {
      const geo = new THREE.CylinderGeometry(0.05, 0.145, 1.44, 36, 28);
      geo.translate(0, 0.72, 0);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);
        const t = THREE.MathUtils.clamp(y / 1.44, 0, 1);

        const widthProfile = Math.sin(t * Math.PI) * 1.50 + (1.0 - t) * 0.42;
        x *= widthProfile;

        z *= 0.45;
        if (z > 0) {
          z -= Math.max(0, (1.0 - Math.pow(x / 0.22, 2))) * 0.045 * Math.sin(t * Math.PI);
        }

        x += sideSign * Math.pow(t, 1.65) * 0.36;
        z += Math.sin(t * Math.PI) * 0.11;

        pos.setXYZ(i, x, y, z);
      }
      geo.computeVertexNormals();
      return geo;
    }

    function createSculptedKittyEarGeometry() {
      const geo = new THREE.ConeGeometry(0.285, 0.65, 36, 20);
      geo.translate(0, 0.325, 0);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);
        const t = THREE.MathUtils.clamp(y / 0.65, 0, 1);

        z *= 0.60;
        if (z > 0) {
          z -= Math.max(0, 1.0 - Math.abs(x) * 3.1) * 0.06 * (1.0 - t);
        }
        z -= Math.pow(t, 2.0) * 0.06;

        pos.setXYZ(i, x, y, z);
      }
      geo.computeVertexNormals();
      return geo;
    }

    function createVelvetMascot3D(config) {
      const root = new THREE.Group();

      // 1. Soft Studio Contact Shadow
      const shadowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.95, 1.30),
        new THREE.MeshBasicMaterial({
          map: shadowTexture,
          transparent: true,
          depthWrite: false
        })
      );
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.set(0, 0.02, 0.04);
      root.add(shadowMesh);

      const bodyPivot = new THREE.Group();
      root.add(bodyPivot);

      const velvetMat = createVelvetPlushMaterial(config.bodyColor, config.emissiveRim);
      const innerEarMat = createVelvetPlushMaterial(config.innerEarColor, config.emissiveRim);
      const bellyVelvetMat = createVelvetPlushMaterial(config.bellyColor, 0x221122);
      const pawPadMat = new THREE.MeshStandardMaterial({
        color: config.pawPadColor,
        roughness: 0.28,
        metalness: 0.05
      });

      // 2. PEAR-SHAPED VELVET TORSO + BELLY PATCH + CHEST FUR TUFTS + COLLAR & GOLDEN BELL
      const torsoMesh = new THREE.Mesh(createSculptedTorsoGeometry(), velvetMat);
      torsoMesh.position.set(0, 0.72, 0);
      bodyPivot.add(torsoMesh);

      const bellyPatch = new THREE.Mesh(new THREE.SphereGeometry(0.33, 28, 24), bellyVelvetMat);
      bellyPatch.scale.set(0.95, 1.12, 0.38);
      bellyPatch.position.set(0, 0.67, 0.37);
      bodyPivot.add(bellyPatch);

      [-0.05, 0.0, 0.05].forEach((cx, idx) => {
        const chestTuft = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.14, 14), bellyVelvetMat);
        chestTuft.position.set(cx, 0.90 - Math.abs(idx - 1) * 0.02, 0.42);
        chestTuft.rotation.x = 2.4;
        chestTuft.rotation.z = (idx - 1) * 0.25;
        bodyPivot.add(chestTuft);
      });

      const collarMat = new THREE.MeshStandardMaterial({
        color: config.collarColor,
        roughness: 0.42
      });
      const collarRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.042, 14, 32), collarMat);
      collarRing.rotation.x = Math.PI / 2 + 0.08;
      collarRing.position.set(0, 1.05, 0.04);
      bodyPivot.add(collarRing);

      const goldBellMat = new THREE.MeshStandardMaterial({
        color: 0xffd166,
        roughness: 0.18,
        metalness: 0.85
      });
      const goldBell = new THREE.Mesh(new THREE.SphereGeometry(0.076, 20, 20), goldBellMat);
      goldBell.position.set(0, 1.00, 0.38);
      bodyPivot.add(goldBell);

      // Wagging Plush Tail
      const tailPivot = new THREE.Group();
      tailPivot.position.set(0, 0.48, -0.42);
      bodyPivot.add(tailPivot);
      if (config.species === 'purple_kitty') {
        const catTailCurve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0.25, -0.32),
          new THREE.Vector3(0.18, 0.56, -0.22)
        );
        const catTailMesh = new THREE.Mesh(new THREE.TubeGeometry(catTailCurve, 18, 0.078, 14, false), velvetMat);
        tailPivot.add(catTailMesh);
      } else {
        const pomTail = new THREE.Mesh(new THREE.SphereGeometry(0.165, 20, 20), bellyVelvetMat);
        pomTail.position.set(0, 0.06, -0.08);
        tailPivot.add(pomTail);
      }

      // 3. CHUBBY FLARED FLAT-BOTTOMED PLUSH LEGS + GLOSSY TOE BEANS
      const leftLegGroup = new THREE.Group();
      leftLegGroup.position.set(-0.24, 0.56, 0.0);
      leftLegGroup.rotation.z = -0.06;
      bodyPivot.add(leftLegGroup);

      const rightLegGroup = new THREE.Group();
      rightLegGroup.position.set(0.24, 0.56, 0.0);
      rightLegGroup.rotation.z = 0.06;
      bodyPivot.add(rightLegGroup);

      const leftLegMesh = new THREE.Mesh(createSeamlessPlushLegGeometry(-1), velvetMat);
      leftLegGroup.add(leftLegMesh);

      const rightLegMesh = new THREE.Mesh(createSeamlessPlushLegGeometry(1), velvetMat);
      rightLegGroup.add(rightLegMesh);

      [leftLegGroup, rightLegGroup].forEach((legGrp, idx) => {
        const sideSign = idx === 0 ? -1 : 1;
        [-0.065, 0.0, 0.065].forEach((tx, tIdx) => {
          const toeBean = new THREE.Mesh(new THREE.SphereGeometry(0.038, 14, 14), pawPadMat);
          toeBean.scale.set(1.0, 1.2, 0.65);
          toeBean.position.set(tx + sideSign * 0.03, -0.50 + (tIdx === 1 ? 0.015 : 0), 0.335);
          legGrp.add(toeBean);
        });
      });

      // 4. WIDE CUDDLE-SHAPED VELVET HEAD + CHEEK TUFTS + BEAD EYES
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 1.38, 0.06);
      bodyPivot.add(headGroup);

      const headMesh = new THREE.Mesh(createSculptedPlushHeadGeometry(), velvetMat);
      headGroup.add(headMesh);

      [-1, 1].forEach((sideSign) => {
        [-0.06, 0.04].forEach((ty, tIdx) => {
          const cheekTuft = new THREE.Mesh(new THREE.ConeGeometry(0.082, 0.21, 16), velvetMat);
          cheekTuft.position.set(sideSign * 0.63, -0.13 + ty, 0.08);
          cheekTuft.rotation.z = sideSign * (-1.30 - tIdx * 0.20);
          cheekTuft.rotation.y = sideSign * 0.22;
          headGroup.add(cheekTuft);
        });
      });

      [-0.085, 0.085].forEach((mx) => {
        const muzzlePuff = new THREE.Mesh(new THREE.SphereGeometry(0.115, 20, 18), bellyVelvetMat);
        muzzlePuff.scale.set(1.12, 0.86, 0.68);
        muzzlePuff.position.set(mx, -0.145, 0.57);
        headGroup.add(muzzlePuff);
      });

      const blushGroup = new THREE.Group();
      const blushMat = new THREE.MeshBasicMaterial({
        color: 0xff4d79,
        transparent: true,
        opacity: 0.24
      });
      [-0.36, 0.36].forEach((bx) => {
        const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 16), blushMat);
        cheek.scale.set(1.3, 0.82, 0.45);
        cheek.position.set(bx, -0.13, 0.51);
        blushGroup.add(cheek);
      });
      headGroup.add(blushGroup);

      // Glossy Black Bead Eyes with Dual White Catchlights & Expressive 3D Eyebrows
      const eyesGroup = new THREE.Group();
      const blackBeadMat = new THREE.MeshStandardMaterial({
        color: 0x050508,
        roughness: 0.04,
        metalness: 0.12
      });
      const catchlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const eyebrowMat = createVelvetPlushMaterial(config.deepShadowColor, 0x050508);

      const eyeHolders = [];
      const sadEyelids = [];
      const eyebrows = [];

      [-0.185, 0.185].forEach((ex, i) => {
        const sideSign = i === 0 ? -1 : 1;
        const eyeHolder = new THREE.Group();
        eyeHolder.position.set(ex, -0.025, 0.555);
        eyeHolder.rotation.z = sideSign * -0.08;

        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.090, 28, 28), blackBeadMat);
        bead.scale.set(1.05, 1.20, 0.74);
        eyeHolder.add(bead);

        const glint1 = new THREE.Mesh(new THREE.SphereGeometry(0.029, 14, 14), catchlightMat);
        glint1.scale.set(1.15, 0.95, 0.6);
        glint1.position.set(-0.026, 0.038, 0.062);
        eyeHolder.add(glint1);

        const glint2 = new THREE.Mesh(new THREE.SphereGeometry(0.015, 12, 12), catchlightMat);
        glint2.position.set(0.026, -0.026, 0.062);
        eyeHolder.add(glint2);

        const eyelidGeo = new THREE.SphereGeometry(0.098, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
        const eyelidMesh = new THREE.Mesh(eyelidGeo, velvetMat);
        eyelidMesh.scale.set(1.08, 1.15, 0.82);
        eyelidMesh.rotation.x = -0.35;
        eyelidMesh.rotation.z = sideSign * -0.28;
        eyelidMesh.visible = false;
        eyeHolder.add(eyelidMesh);
        sadEyelids.push(eyelidMesh);

        const browPivot = new THREE.Group();
        browPivot.position.set(ex, 0.145, 0.565);
        browPivot.userData = { sideSign, baseY: 0.145, baseRotZ: sideSign * -0.10 };
        const browGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.14, 12);
        browGeo.rotateZ(Math.PI / 2);
        const browMesh = new THREE.Mesh(browGeo, eyebrowMat);
        browMesh.scale.set(1.0, 0.85, 0.65);
        browPivot.add(browMesh);
        headGroup.add(browPivot);
        eyebrows.push(browPivot);

        eyesGroup.add(eyeHolder);
        eyeHolders.push(eyeHolder);
      });
      headGroup.add(eyesGroup);

      // Button Nose & Stitched Smile
      const noseVelvetMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0f,
        roughness: 0.25,
        metalness: 0.08
      });
      const noseGeo = new THREE.ConeGeometry(0.062, 0.056, 20);
      noseGeo.rotateX(Math.PI / 2);
      noseGeo.rotateZ(Math.PI);
      const noseMesh = new THREE.Mesh(noseGeo, noseVelvetMat);
      noseMesh.scale.set(1.30, 0.86, 0.92);
      noseMesh.position.set(0, -0.095, 0.648);
      headGroup.add(noseMesh);

      const smileCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.055, -0.175, 0.635),
        new THREE.Vector3(0, -0.21, 0.645),
        new THREE.Vector3(0.055, -0.175, 0.635)
      );
      const smileStitch = new THREE.Mesh(
        new THREE.TubeGeometry(smileCurve, 12, 0.0085, 8, false),
        noseVelvetMat
      );
      headGroup.add(smileStitch);

      const mouthMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.5 });
      const mouthMesh = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.016, 12, 18, Math.PI), mouthMat);
      mouthMesh.position.set(0, -0.21, 0.63);
      mouthMesh.visible = false;
      headGroup.add(mouthMesh);

      // 3 Delicate White Whiskers per Cheek
      const whiskerMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2
      });
      [-1, 1].forEach((side) => {
        [-0.07, 0.0, 0.07].forEach((wy) => {
          const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(side * 0.16, -0.13 + wy * 0.42, 0.58),
            new THREE.Vector3(side * 0.36, -0.12 + wy * 0.72, 0.57),
            new THREE.Vector3(side * 0.55, -0.14 + wy * 1.10, 0.50)
          );
          const whiskerGeo = new THREE.TubeGeometry(curve, 14, 0.0072, 8, false);
          const whisker = new THREE.Mesh(whiskerGeo, whiskerMat);
          headGroup.add(whisker);
        });
      });

      // 5. SPECIES-SPECIFIC SCULPTED EARS & FOREHEAD TUFTS
      const earsGroup = new THREE.Group();
      headGroup.add(earsGroup);

      if (config.species === 'purple_kitty') {
        [-1, 1].forEach((side) => {
          const earPivot = new THREE.Group();
          earPivot.position.set(side * 0.44, 0.28, -0.02);
          earPivot.rotation.z = side * -0.50;
          earPivot.rotation.y = side * -0.20;
          earPivot.userData = { baseRotZ: side * -0.50, side };

          const earOuter = new THREE.Mesh(createSculptedKittyEarGeometry(), velvetMat);
          earPivot.add(earOuter);

          const earInner = new THREE.Mesh(createSculptedKittyEarGeometry(), innerEarMat);
          earInner.scale.set(0.66, 0.75, 0.52);
          earInner.position.set(0, 0.04, 0.04);
          earPivot.add(earInner);

          earsGroup.add(earPivot);
        });

        [-0.12, 0.0, 0.12].forEach((tx, idx) => {
          const curlCurve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(tx, 0.50, 0.12),
            new THREE.Vector3(tx + (idx - 1) * 0.04, 0.72 - Math.abs(idx - 1) * 0.04, 0.32),
            new THREE.Vector3(tx - 0.03, 0.42, 0.46)
          );
          const curlGeo = new THREE.TubeGeometry(curlCurve, 18, 0.066 - Math.abs(idx - 1) * 0.008, 14, false);
          const curlMesh = new THREE.Mesh(curlGeo, velvetMat);
          headGroup.add(curlMesh);
        });

      } else if (config.species === 'pink_bunny') {
        [-1, 1].forEach((side) => {
          const earPivot = new THREE.Group();
          earPivot.position.set(side * 0.20, 0.46, -0.04);
          earPivot.rotation.z = side * -0.16;
          earPivot.rotation.x = 0.08;
          earPivot.userData = { baseRotZ: side * -0.16, side };

          const bunnyEar = new THREE.Mesh(createSculptedBunnyEarGeometry(side), velvetMat);
          earPivot.add(bunnyEar);

          const innerBunnyEar = new THREE.Mesh(createSculptedBunnyEarGeometry(side), innerEarMat);
          innerBunnyEar.scale.set(0.60, 0.86, 0.52);
          innerBunnyEar.position.set(0, 0.06, 0.035);
          earPivot.add(innerBunnyEar);

          earsGroup.add(earPivot);
        });

      } else if (config.species === 'coral_puppy') {
        [-1, 1].forEach((side) => {
          const earPivot = new THREE.Group();
          earPivot.position.set(side * 0.50, 0.22, 0.02);
          earPivot.rotation.z = side * 0.36;
          earPivot.userData = { baseRotZ: side * 0.36, side };

          const flopGeo = new THREE.SphereGeometry(0.22, 28, 24);
          flopGeo.scale(0.66, 1.85, 0.44);
          flopGeo.translate(0, -0.26, 0);
          const flopMesh = new THREE.Mesh(flopGeo, velvetMat);
          earPivot.add(flopMesh);

          const flopInner = new THREE.Mesh(flopGeo, innerEarMat);
          flopInner.scale.set(0.72, 0.85, 0.65);
          flopInner.position.set(0, 0, 0.03);
          earPivot.add(flopInner);

          earsGroup.add(earPivot);
        });

        const pupCurl = new THREE.Mesh(new THREE.SphereGeometry(0.115, 18, 18), velvetMat);
        pupCurl.scale.set(0.8, 1.4, 1.1);
        pupCurl.position.set(0, 0.56, 0.18);
        pupCurl.rotation.x = 0.4;
        headGroup.add(pupCurl);

      } else if (config.species === 'minty_cub') {
        [-1, 1].forEach((side) => {
          const earPivot = new THREE.Group();
          earPivot.position.set(side * 0.45, 0.42, -0.02);
          earPivot.rotation.z = side * -0.45;
          earPivot.userData = { baseRotZ: side * -0.45, side };

          const roundOuter = new THREE.Mesh(new THREE.SphereGeometry(0.24, 28, 28), velvetMat);
          roundOuter.scale.set(1.0, 1.05, 0.50);
          earPivot.add(roundOuter);

          const roundInner = new THREE.Mesh(new THREE.SphereGeometry(0.135, 20, 20), innerEarMat);
          roundInner.scale.set(1.0, 1.0, 0.44);
          roundInner.position.set(0, -0.02, 0.07);
          earPivot.add(roundInner);

          earsGroup.add(earPivot);
        });

        [-0.07, 0.07].forEach((tx, idx) => {
          const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 16), velvetMat);
          tuft.scale.set(0.75, 1.45, 0.9);
          tuft.position.set(tx, 0.56, 0.20);
          tuft.rotation.z = idx === 0 ? 0.3 : -0.3;
          headGroup.add(tuft);
        });
      }

      // 6. SEAMLESS PLUSH ARMS WITH GLOSSY PALM PAW PADS
      const armGeo = createSeamlessPlushArmGeometry();

      const leftArmPivot = new THREE.Group();
      leftArmPivot.position.set(-0.36, 0.96, 0.12);
      const leftArmMesh = new THREE.Mesh(armGeo, velvetMat);
      leftArmPivot.add(leftArmMesh);
      const leftPalmPad = new THREE.Mesh(new THREE.SphereGeometry(0.070, 16, 16), pawPadMat);
      leftPalmPad.scale.set(1.1, 1.2, 0.55);
      leftPalmPad.position.set(0, 0.52, 0.10);
      leftArmPivot.add(leftPalmPad);
      bodyPivot.add(leftArmPivot);

      const rightArmPivot = new THREE.Group();
      rightArmPivot.position.set(0.36, 0.96, 0.12);
      const rightArmMesh = new THREE.Mesh(armGeo, velvetMat);
      rightArmPivot.add(rightArmMesh);
      const rightPalmPad = new THREE.Mesh(new THREE.SphereGeometry(0.070, 16, 16), pawPadMat);
      rightPalmPad.scale.set(1.1, 1.2, 0.55);
      rightPalmPad.position.set(0, 0.52, 0.10);
      rightArmPivot.add(rightPalmPad);
      bodyPivot.add(rightArmPivot);

      // 7. CLEAN WHITE POSTER BOARD HELD HIGH OVERHEAD ("HAATH UPER KARKE")
      const signHolderGroup = new THREE.Group();
      signHolderGroup.position.set(0, 2.50, 0.24);
      bodyPivot.add(signHolderGroup);

      const boardW = 3.10;
      const boardH = 1.78;

      const posterShadowMat = new THREE.MeshBasicMaterial({
        color: 0x181820,
        transparent: true,
        opacity: 0.10
      });
      const posterShadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(boardW * 1.01, boardH * 1.02),
        posterShadowMat
      );
      posterShadowPlane.position.set(0.05, -0.05, -0.04);
      signHolderGroup.add(posterShadowPlane);

      const whiteSheetEdgeMat = new THREE.MeshStandardMaterial({
        color: 0xf4f1f6,
        roughness: 0.85
      });
      const cardboardBacking = new THREE.Mesh(
        new THREE.BoxGeometry(boardW * 0.97, boardH * 0.94, 0.04),
        whiteSheetEdgeMat
      );
      signHolderGroup.add(cardboardBacking);

      const posterTex = getOrCreatePosterTexture(config);
      const posterFaceMat = new THREE.MeshBasicMaterial({
        map: posterTex,
        transparent: true
      });
      const posterFace = new THREE.Mesh(
        new THREE.PlaneGeometry(boardW, boardH),
        posterFaceMat
      );
      posterFace.position.z = 0.025;
      signHolderGroup.add(posterFace);

      [-0.68, 0.68].forEach((gx) => {
        const gripPaw = new THREE.Mesh(new THREE.SphereGeometry(0.148, 20, 20), velvetMat);
        gripPaw.scale.set(1.15, 0.88, 1.05);
        gripPaw.position.set(gx, -boardH * 0.45, 0.05);
        signHolderGroup.add(gripPaw);

        const gripPad = new THREE.Mesh(new THREE.SphereGeometry(0.076, 14, 14), pawPadMat);
        gripPad.scale.set(1.1, 0.85, 0.65);
        gripPad.position.set(gx, -boardH * 0.45, 0.16);
        signHolderGroup.add(gripPad);
      });

      // 8. 3D SLAP IMPACT STARBURST RING
      const slapImpactMat = new THREE.MeshBasicMaterial({
        color: 0xffbe0b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0
      });
      const slapImpactMesh = new THREE.Mesh(new THREE.RingGeometry(0.20, 0.72, 10), slapImpactMat);
      slapImpactMesh.position.set(0, 1.32, 0.78);
      bodyPivot.add(slapImpactMesh);

      const CHAR_SCALE = 0.36;
      bodyPivot.scale.setScalar(CHAR_SCALE);
      shadowMesh.scale.setScalar(CHAR_SCALE);

      [headMesh, torsoMesh, cardboardBacking, posterFace].forEach((m) => {
        m.userData = { mascotId: config.id };
        interactiveMeshes.push(m);
      });

      root.userData = {
        id: config.id,
        config,
        heldPosterConfig: config,
        boardVisible: true,
        charScale: CHAR_SCALE,
        bodyPivot,
        torsoMesh,
        tailPivot,
        headGroup,
        eyesGroup,
        eyeHolders,
        eyebrows,
        sadEyelids,
        blushMat,
        mouthMesh,
        earsGroup,
        leftLegGroup,
        rightLegGroup,
        leftArmPivot,
        rightArmPivot,
        signHolderGroup,
        posterFaceMat,
        slapImpactMesh,
        slapImpactMat,
        shadowMesh,

        currentSlot: config.initialSlot,
        state: 'IDLE_ON_BLOCK',
        reservedByHook: false,
        waypoints: [],
        wpIndex: 0,
        wpTimer: 0,
        actionTimer: 0,
        victimMascot: null,
        targetClaimSlot: null,
        oldSlotForVictim: null,
        hovered: false,
        posterScaleCurrent: 0.01,
        facingYaw: 0,
        dustSpawnTimer: 0,

        blinkTimer: 1.5 + Math.random() * 3.0,
        blinkPhase: 0,
        isDoubleBlink: false,
        earTwitchTimer: 2.0 + Math.random() * 3.5,
        earTwitchPhase: 0,
        earTwitchSide: 0,

        thoughtText: config.idleThoughts[0],
        thoughtStyle: 'normal',
        thoughtTimer: 4.5,
        idleThoughtIndex: 0,
        idleThoughtCooldown: 3.5 + config.id * 0.9
      };

      return root;
    }

    // ============================================================================
    // 4B. CUTE 3D CARTOON DUST PUFFS WHEN SCURRYING ACROSS THE WHITE FLOOR
    // ============================================================================
    function spawnFloorDustPuff(worldPos) {
      const puffGeo = new THREE.SphereGeometry(0.065, 10, 10);
      const puffMat = new THREE.MeshBasicMaterial({
        color: 0xe2d9e0,
        transparent: true,
        opacity: 0.85
      });
      const puff = new THREE.Mesh(puffGeo, puffMat);
      puff.position.set(
        worldPos.x + (Math.random() - 0.5) * 0.14,
        worldPos.y + 0.04,
        worldPos.z - 0.05
      );
      scene.add(puff);
      dustParticles.push({
        mesh: puff,
        mat: puffMat,
        age: 0,
        maxAge: 0.42,
        vx: (Math.random() - 0.5) * 0.38,
        vy: 0.24 + Math.random() * 0.20
      });
    }

    function updateDustParticles(delta) {
      for (let i = dustParticles.length - 1; i >= 0; i--) {
        const p = dustParticles[i];
        p.age += delta;
        if (p.age >= p.maxAge) {
          scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          p.mat.dispose();
          dustParticles.splice(i, 1);
        } else {
          const t = p.age / p.maxAge;
          p.mesh.position.x += p.vx * delta;
          p.mesh.position.y += p.vy * delta;
          p.mesh.scale.setScalar(1.0 + t * 1.4);
          p.mat.opacity = 0.85 * (1.0 - t);
        }
      }
    }

    // ============================================================================
    // 5. COMPUTE 3D WORLD COORDINATES FOR EVERY BLOCK TOP, STEPPING STONE & FLOOR
    // ============================================================================
    function getHeroViewport() {
      const canvas = document.getElementById('webgl-canvas');
      const rect = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      return {
        left: rect.left,
        top: rect.top,
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height)
      };
    }

    function screenPixelToWorld3D(screenX, screenY) {
      const viewport = getHeroViewport();
      const ndcX = (screenX / viewport.width) * 2 - 1;
      const ndcY = -(screenY / viewport.height) * 2 + 1;

      const vec = new THREE.Vector3(ndcX, ndcY, 0.5);
      vec.unproject(camera);
      const dir = vec.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      return camera.position.clone().add(dir.multiplyScalar(distance));
    }

    function computeSlotWorldCoordinates() {
      if (!camera) return;
      const viewport = getHeroViewport();
      const floorScreenY = viewport.height - 16;

      slotPositions = SLOT_DEFS.map((def, idx) => {
        const topEl = document.getElementById(def.topBlockId);
        const topRect = topEl
          ? (() => {
              const rect = topEl.getBoundingClientRect();
              return { left: rect.left - viewport.left, top: rect.top - viewport.top, width: rect.width, height: rect.height };
            })()
          : { left: 100 + idx * 240, top: viewport.height - 160, width: 120, height: 120 };

        let perchScreenX = topRect.left + topRect.width * 0.5;
        if (idx === 0) perchScreenX = Math.max(topRect.left + topRect.width * 0.54, 76);
        if (idx === 3) perchScreenX = Math.min(topRect.left + topRect.width * 0.46, viewport.width - 76);

        const perchScreenY = topRect.top + 2;
        const perchWorld = screenPixelToWorld3D(perchScreenX, perchScreenY);

        const attackOffsetPx = def.side === 'left' ? 26 : -26;
        const attackLedgeWorld = screenPixelToWorld3D(perchScreenX + attackOffsetPx, perchScreenY);

        let stepWorld = null;
        let floorFrontScreenX = perchScreenX;

        if (def.stepBlockId) {
          const stepEl = document.getElementById(def.stepBlockId);
          if (stepEl) {
            const sRect = stepEl.getBoundingClientRect();
            const stepScreenX = sRect.left - viewport.left + sRect.width * 0.5;
            const stepScreenY = sRect.top - viewport.top + 2;
            stepWorld = screenPixelToWorld3D(stepScreenX, stepScreenY);
            floorFrontScreenX = def.side === 'left' ? sRect.right + 16 : sRect.left - 16;
            floorFrontScreenX -= viewport.left;
          }
        } else {
          floorFrontScreenX = def.side === 'left' ? topRect.left + topRect.width + 16 : topRect.left - 16;
        }

        const floorWorld = screenPixelToWorld3D(floorFrontScreenX, floorScreenY);
        const offscreenWorld = screenPixelToWorld3D(
          def.side === 'left' ? -70 : viewport.width + 70,
          floorScreenY
        );

        return {
          slotIndex: idx,
          perchScreenX,
          perchScreenY,
          perchWorld,
          attackLedgeWorld,
          stepWorld,
          floorWorld,
          offscreenWorld,
          side: def.side,
          isHighStack: def.isHighStack
        };
      });
    }

    // ============================================================================
    // 5B. TOP MECHANICAL CLAW HOOK KIDNAP, REALISTIC TIMING & CROSS-BLOCK SWAP
    // ============================================================================
    function startScaredFleeFromHookDrop(displacedMascot, fromSlotIndex, destSlotIndex) {
      const d2 = displacedMascot.userData;
      const fromSlot = slotPositions[fromSlotIndex];
      const destSlot = slotPositions[destSlotIndex];
      if (!fromSlot || !destSlot) return;

      d2.currentSlot = destSlotIndex;
      d2.reservedByHook = false;
      d2.state = 'SCARED_BY_HOOK_DROP';
      d2.actionTimer = 0;

      // Wide eyes, arched brows, rosy cheeks, panic mouth
      d2.blushMat.opacity = 0.95;
      d2.mouthMesh.visible = true;
      d2.mouthMesh.rotation.z = 0;
      setMascotThoughtBubble(displacedMascot, 'Arey bhaago!! Upar se kaun gira!! 😱🏃‍♂️', 'scream', 2.4);
      playCartoonSound('scared_flee');

      const wps = [];
      // 1. Scramble down off targetBlock via stepping stone
      if (fromSlot.stepWorld) {
        wps.push({
          type: 'SCARED_FLEE_STEP_DOWN',
          from: fromSlot.perchWorld.clone(),
          to: fromSlot.stepWorld.clone(),
          duration: 0.30,
          arcHeight: 0.14
        });
        wps.push({
          type: 'SCARED_FLEE_STEP_DOWN',
          from: fromSlot.stepWorld.clone(),
          to: fromSlot.floorWorld.clone(),
          duration: 0.30,
          arcHeight: 0.14
        });
      } else {
        wps.push({
          type: 'SCARED_FLEE_STEP_DOWN',
          from: fromSlot.perchWorld.clone(),
          to: fromSlot.floorWorld.clone(),
          duration: 0.34,
          arcHeight: 0.16
        });
      }

      // 2. Run fast across the floor ("darr ke bhaag ke") to p1's old vacated block
      const floorDist = fromSlot.floorWorld.distanceTo(destSlot.floorWorld);
      const runDur = THREE.MathUtils.clamp(floorDist * 0.10, 0.72, 1.32);
      wps.push({
        type: 'SCARED_FLEE_FLOOR_RUN',
        from: fromSlot.floorWorld.clone(),
        to: destSlot.floorWorld.clone(),
        duration: runDur
      });

      // 3. Climb up onto p1's old vacated block
      if (destSlot.stepWorld) {
        wps.push({
          type: 'SCARED_FLEE_CLIMB_UP',
          from: destSlot.floorWorld.clone(),
          to: destSlot.stepWorld.clone(),
          duration: 0.36,
          arcHeight: 0.16
        });
        wps.push({
          type: 'SCARED_FLEE_CLIMB_UP',
          from: destSlot.stepWorld.clone(),
          to: destSlot.perchWorld.clone(),
          duration: 0.38,
          arcHeight: 0.18,
          safeOnNewBlockAtEnd: true
        });
      } else {
        wps.push({
          type: 'SCARED_FLEE_CLIMB_UP',
          from: destSlot.floorWorld.clone(),
          to: destSlot.perchWorld.clone(),
          duration: 0.42,
          arcHeight: 0.20,
          safeOnNewBlockAtEnd: true
        });
      }

      d2.waypoints = wps;
      d2.wpIndex = 0;
      d2.wpTimer = 0;
    }

    function triggerClawPosterStealSequence(preferredMascotIndex, e) {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      triggerClawGrabSequence(preferredMascotIndex, null, 'POSTER_EXCHANGE');
    }

    function triggerClawGrabSequence(preferredMascotIndex, e, forcedMode) {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      if (clawState.phase !== 'PATROL') return;

      computeSlotWorldCoordinates();

      const idlePets = mascots.filter(
        (m) => m.userData.state === 'IDLE_ON_BLOCK' && !m.userData.reservedByHook && m.userData.boardVisible !== false
      );
      if (idlePets.length === 0) return;
      clawState.autoNextTime = Infinity;

      let chosenMascot = null;
      if (preferredMascotIndex !== undefined) {
        const candidate = mascots[preferredMascotIndex];
        if (candidate && candidate.userData.state === 'IDLE_ON_BLOCK' && !candidate.userData.reservedByHook) {
          chosenMascot = candidate;
        }
      }
      if (!chosenMascot) {
        chosenMascot = idlePets[Math.floor(Math.random() * idlePets.length)];
      }

      const d1 = chosenMascot.userData;
      const originSlot = slotPositions[d1.currentSlot];
      if (!originSlot) return;

      const otherIdlePets = idlePets.filter((m) => m !== chosenMascot);

      // Determine whether to run POSTER_EXCHANGE ("Oye mera poster waapis de!!") or PET_KIDNAP ("Oye bachaao mujhe!!")
      let selectedMode = forcedMode;
      if (!selectedMode || selectedMode === 'AUTO') {
        if (otherIdlePets.length > 0 && clawState.autoModeToggle % 2 === 0) {
          selectedMode = 'POSTER_EXCHANGE';
        } else {
          selectedMode = 'PET_KIDNAP';
        }
        clawState.autoModeToggle++;
      }
      if (selectedMode === 'POSTER_EXCHANGE' && otherIdlePets.length === 0) {
        selectedMode = 'PET_KIDNAP';
      }

      clawState.mode = selectedMode;
      d1.reservedByHook = true;

      if (selectedMode === 'POSTER_EXCHANGE') {
        const partnerPet = otherIdlePets[Math.floor(Math.random() * otherIdlePets.length)];
        partnerPet.userData.reservedByHook = true;

        getAudioCtx();
        playCartoonSound('claw_servo');

        clawState.grabbedMascot = chosenMascot;
        clawState.displacedMascot = partnerPet;
        clawState.originSlotIndex = d1.currentSlot;
        clawState.targetSlotIndex = partnerPet.userData.currentSlot;
        clawState.stolenPosterConfigA = d1.heldPosterConfig || d1.config;
        clawState.stolenPosterConfigB = partnerPet.userData.heldPosterConfig || partnerPet.userData.config;
        clawState.noticeTriggered = false;
        clawState.displacedFleeTriggered = false;
        clawState.midScreamSwitched = false;

        clawState.phase = 'POSTER_ALIGN_ABOVE_PET_A';
        clawState.phaseTimer = 0;
        clawState.startScreenX = clawState.screenX;
        clawState.targetScreenX = originSlot.perchScreenX;
        const distPx = Math.abs(clawState.targetScreenX - clawState.startScreenX);
        clawState.phaseDuration = THREE.MathUtils.clamp(distPx / 460, 0.50, 1.15);
        clawState.startCableLength = clawState.cableLength;
        clawState.targetCableLength = 28;
        return;
      }

      // PET_KIDNAP MODE ("Oye bachaao mujhe!!")
      const shouldRelocate = otherIdlePets.length > 0 && (clawState.grabCount === 0 || Math.random() < 0.80);
      clawState.grabCount++;

      let displacedMascot = null;
      let targetSlotIndex = d1.currentSlot;

      if (shouldRelocate) {
        displacedMascot = otherIdlePets[Math.floor(Math.random() * otherIdlePets.length)];
        displacedMascot.userData.reservedByHook = true;
        targetSlotIndex = displacedMascot.userData.currentSlot;
      }

      getAudioCtx();
      playCartoonSound('claw_servo');

      clawState.grabbedMascot = chosenMascot;
      clawState.displacedMascot = displacedMascot;
      clawState.originSlotIndex = d1.currentSlot;
      clawState.targetSlotIndex = targetSlotIndex;
      clawState.willRelocateToOtherBlock = shouldRelocate;
      clawState.noticeTriggered = false;
      clawState.displacedFleeTriggered = false;
      clawState.midScreamSwitched = false;

      clawState.phase = 'ALIGN_ABOVE_PET';
      clawState.phaseTimer = 0;
      clawState.startScreenX = clawState.screenX;
      clawState.targetScreenX = originSlot.perchScreenX;
      const distPx = Math.abs(clawState.targetScreenX - clawState.startScreenX);
      clawState.phaseDuration = THREE.MathUtils.clamp(distPx / 460, 0.55, 1.20);
      clawState.startCableLength = clawState.cableLength;
      clawState.targetCableLength = 28;
    }

    function updateClawHookMachine(delta, time) {
      if (clawState.phase === 'PATROL') {
        if (flyingPosterGroup) flyingPosterGroup.visible = false;
        if (time >= clawState.autoNextTime) {
          triggerClawGrabSequence(undefined, null, 'AUTO');
          if (clawState.phase !== 'PATROL') return;
        }
        const centerStageX = window.innerWidth * 0.42;
        const patrolTargetX = centerStageX + Math.sin(time * 0.75) * Math.min(180, window.innerWidth * 0.22);
        clawState.screenX = THREE.MathUtils.lerp(clawState.screenX, patrolTargetX, delta * 2.5);
        clawState.cableLength = THREE.MathUtils.lerp(clawState.cableLength, 26, delta * 5.0);
        clawState.prongOpenDeg = THREE.MathUtils.lerp(clawState.prongOpenDeg, 14, delta * 6.0);
        clawState.swayAngleDeg = Math.sin(time * 2.2) * 2.5;

        updateClawDOMElements();
        return;
      }

      const mascot = clawState.grabbedMascot;
      if (!mascot) {
        if (flyingPosterGroup) flyingPosterGroup.visible = false;
        clawState.phase = 'PATROL';
        updateClawDOMElements();
        return;
      }

      const d1 = mascot.userData;
      const partnerMascot = clawState.displacedMascot;
      const d2 = partnerMascot ? partnerMascot.userData : null;
      const originSlot = slotPositions[clawState.originSlotIndex];
      const targetSlot = slotPositions[clawState.targetSlotIndex] || originSlot;

      clawState.phaseTimer += delta;
      const p = Math.min(clawState.phaseTimer / Math.max(0.01, clawState.phaseDuration), 1.0);
      const easeInOut = 0.5 - 0.5 * Math.cos(p * Math.PI);

      // Helper to sync the 3D flying poster board to the mechanical claw's tip
      const syncFlyingPosterToClaw = () => {
        if (!flyingPosterGroup) return;
        const tipScreenY = 60 + clawState.cableLength + 42;
        const tipWorld = screenPixelToWorld3D(clawState.screenX, tipScreenY);
        flyingPosterGroup.position.set(tipWorld.x, tipWorld.y, tipWorld.z + 0.15);
        flyingPosterGroup.rotation.z = THREE.MathUtils.degToRad(-clawState.swayAngleDeg * 1.25);
        flyingPosterGroup.rotation.y = Math.sin(time * 8.0) * 0.14;
      };

      // ========================================================================
      // MODE B: HOOK_POSTER_EXCHANGE ("Oye mera poster waapis de!! 😡🪧")
      // ========================================================================
      if (clawState.phase === 'POSTER_ALIGN_ABOVE_PET_A') {
        clawState.screenX = THREE.MathUtils.lerp(clawState.startScreenX, clawState.targetScreenX, easeInOut);
        clawState.cableLength = THREE.MathUtils.lerp(clawState.startCableLength, 28, easeInOut);
        clawState.prongOpenDeg = THREE.MathUtils.lerp(14, 34, easeInOut);
        clawState.swayAngleDeg = Math.sin(p * Math.PI) * 5.0 * Math.sign(clawState.targetScreenX - clawState.startScreenX);

        if (p >= 1.0) {
          clawState.phase = 'POSTER_DESCEND_TO_BOARD_A';
          clawState.phaseTimer = 0;
          clawState.phaseDuration = 0.80;
          clawState.startCableLength = clawState.cableLength;
          const boardTopScreenY = (originSlot ? originSlot.perchScreenY : window.innerHeight - 160) - 96;
          clawState.targetCableLength = Math.max(48, boardTopScreenY - 60 - 42);
          clawState.noticeTriggered = false;
          playCartoonSound('claw_servo');
        }

      } else if (clawState.phase === 'POSTER_DESCEND_TO_BOARD_A') {
        clawState.cableLength = THREE.MathUtils.lerp(clawState.startCableLength, clawState.targetCableLength, easeInOut);
        clawState.prongOpenDeg = 34;
        clawState.swayAngleDeg = THREE.MathUtils.lerp(clawState.swayAngleDeg, 0, 0.25);

        // Just before grabbing (p >= 0.68), Pet A looks up in surprise!
        if (p >= 0.68 && !clawState.noticeTriggered) {
          clawState.noticeTriggered = true;
          d1.state = 'POSTER_TARGETED_LOOK_UP';
          d1.actionTimer = 0;
          setMascotThoughtBubble(mascot, 'Hain?! Yeh hook kaha se aa gaya?! 👀', 'burst', 2.4);
          playCartoonSound('funny_boing');
        }

        if (p >= 1.0) {
          // Snatch Pet A's white poster board into the air!
          d1.boardVisible = false;
          d1.signHolderGroup.visible = false;
          d1.state = 'POSTER_STOLEN_TANTRUM';
          d1.actionTimer = 0;

          if (flyingPosterGroup) {
            setFlyingPosterConfig(clawState.stolenPosterConfigA);
            flyingPosterGroup.visible = true;
          }

          setMascotThoughtBubble(mascot, 'Oye mera poster waapis de!! 😠🪧', 'scream', 4.2);
          playCartoonSound('claw_clamp_scream');

          clawState.phase = 'POSTER_SNATCH_LIFT_FROM_A';
          clawState.phaseTimer = 0;
          clawState.phaseDuration = 0.85;
          clawState.startCableLength = clawState.cableLength;
          clawState.targetCableLength = 42;
          clawState.midScreamSwitched = false;
          syncFlyingPosterToClaw();
        }

      } else if (clawState.phase === 'POSTER_SNATCH_LIFT_FROM_A') {
        clawState.prongOpenDeg = THREE.MathUtils.lerp(34, 6, Math.min(1, p * 4.5));
        clawState.cableLength = THREE.MathUtils.lerp(clawState.startCableLength, clawState.targetCableLength, easeInOut);
        clawState.swayAngleDeg = Math.sin(time * 11.0) * 8.0;
        syncFlyingPosterToClaw();

        if (p > 0.55 && !clawState.midScreamSwitched) {
          clawState.midScreamSwitched = true;
          setMascotThoughtBubble(mascot, 'Oye mera poster waapis de!! Chor hook!! 😤🙌', 'scream', 3.8);
          playCartoonSound('funny_boing');
        }

        if (p >= 1.0) {
          clawState.phase = 'POSTER_CARRY_A_TO_PET_B';
          clawState.phaseTimer = 0;
          clawState.startScreenX = clawState.screenX;
          clawState.targetScreenX = targetSlot.perchScreenX;
          const distPx = Math.abs(clawState.targetScreenX - clawState.startScreenX);
          clawState.phaseDuration = THREE.MathUtils.clamp(distPx / 410, 0.85, 1.40);
          clawState.startCableLength = clawState.cableLength;
          clawState.targetCableLength = 44;
          clawState.noticeTriggered = false;
          playCartoonSound('claw_servo');
        }

      } else if (clawState.phase === 'POSTER_CARRY_A_TO_PET_B') {
        clawState.prongOpenDeg = 6;
        clawState.screenX = THREE.MathUtils.lerp(clawState.startScreenX, clawState.targetScreenX, easeInOut);
        clawState.cableLength = THREE.MathUtils.lerp(clawState.startCableLength, clawState.targetCableLength, easeInOut);
        const carryDir = Math.sign(clawState.targetScreenX - clawState.startScreenX) || 1;
        clawState.swayAngleDeg = Math.sin(p * Math.PI) * -9.0 * carryDir + Math.sin(time * 10.0) * 4.0;
        syncFlyingPosterToClaw();

        if (p >= 0.68 && !clawState.noticeTriggered && partnerMascot && d2) {
          clawState.noticeTriggered = true;
          d2.state = 'POSTER_TARGETED_LOOK_UP';
          d2.actionTimer = 0;
          setMascotThoughtBubble(partnerMascot, 'Hain?! Yeh hook kaha se aa gaya?! 👀', 'burst', 2.4);
        }

        if (p >= 1.0) {
          clawState.phase = 'POSTER_DESCEND_AND_SWAP_WITH_B';
          clawState.phaseTimer = 0;
          clawState.phaseDuration = 0.68;
          clawState.startCableLength = clawState.cableLength;
          const boardTopB = targetSlot.perchScreenY - 96;
          clawState.targetCableLength = Math.max(48, boardTopB - 60 - 42);
          playCartoonSound('claw_servo');
        }

      } else if (clawState.phase === 'POSTER_DESCEND_AND_SWAP_WITH_B') {
        clawState.cableLength = THREE.MathUtils.lerp(clawState.startCableLength, clawState.targetCableLength, easeInOut);
        clawState.swayAngleDeg = THREE.MathUtils.lerp(clawState.swayAngleDeg, 0, 0.25);
        syncFlyingPosterToClaw();

        if (p >= 1.0) {
          // Exchange Pet A's poster with Pet B's poster!
          if (partnerMascot && d2) {
            setMascotPosterConfig(partnerMascot, clawState.stolenPosterConfigA);
            d2.state = 'POSTER_SWAPPED_SHOCK';
            d2.actionTimer = 0;
            d2.reservedByHook = false;
            setMascotThoughtBubble(partnerMascot, 'Arey! Mera poster le liya aur iska de diya?! 🤯🪧', 'burst', 4.2);
          }

          // Claw now holds Pet B's poster!
          setFlyingPosterConfig(clawState.stolenPosterConfigB);
          playCartoonSound('funny_boing');

          clawState.phase = 'POSTER_LIFT_FROM_B';
          clawState.phaseTimer = 0;
          clawState.phaseDuration = 0.65;
          clawState.startCableLength = clawState.cableLength;
          clawState.targetCableLength = 42;
        }

      } else if (clawState.phase === 'POSTER_LIFT_FROM_B') {
        clawState.cableLength = THREE.MathUtils.lerp(clawState.startCableLength, clawState.targetCableLength, easeInOut);
        clawState.swayAngleDeg = Math.sin(time * 10.0) * 6.5;
        syncFlyingPosterToClaw();

        if (p >= 1.0) {
          clawState.phase = 'POSTER_CARRY_B_TO_PET_A';
          clawState.phaseTimer = 0;
          clawState.startScreenX = clawState.screenX;
          clawState.targetScreenX = originSlot.perchScreenX;
          const distPx = Math.abs(clawState.targetScreenX - clawState.startScreenX);
          clawState.phaseDuration = THREE.MathUtils.clamp(distPx / 420, 0.80, 1.35);
          clawState.startCableLength = clawState.cableLength;
          clawState.targetCableLength = 44;
          setMascotThoughtBubble(mascot, 'Oye mera poster waapis de!! Chor hook!! 😤🙌', 'scream', 3.0);
          playCartoonSound('claw_servo');
        }

      } else if (clawState.phase === 'POSTER_CARRY_B_TO_PET_A') {
        clawState.screenX = THREE.MathUtils.lerp(clawState.startScreenX, clawState.targetScreenX, easeInOut);
        clawState.cableLength = THREE.MathUtils.lerp(clawState.startCableLength, clawState.targetCableLength, easeInOut);
        const carryDir = Math.sign(clawState.targetScreenX - clawState.startScreenX) || 1;
        clawState.swayAngleDeg = Math.sin(p * Math.PI) * -8.5 * carryDir + Math.sin(time * 10.0) * 4.0;
        syncFlyingPosterToClaw();

        if (p >= 1.0) {
          clawState.phase = 'POSTER_LOWER_AND_DROP_TO_A';
          clawState.phaseTimer = 0;
          clawState.phaseDuration = 0.64;
          clawState.startCableLength = clawState.cableLength;
          const boardTopA = originSlot.perchScreenY - 96;
          clawState.targetCableLength = Math.max(48, boardTopA - 60 - 42);
        }

      } else if (clawState.phase === 'POSTER_LOWER_AND_DROP_TO_A') {
        clawState.cableLength = THREE.MathUtils.lerp(clawState.startCableLength, clawState.targetCableLength, easeInOut);
        clawState.swayAngleDeg = THREE.MathUtils.lerp(clawState.swayAngleDeg, 0, 0.25);
        syncFlyingPosterToClaw();

        if (p >= 1.0) {
          // Deliver Pet B's poster into Pet A's raised hands!
          if (flyingPosterGroup) flyingPosterGroup.visible = false;
          setMascotPosterConfig(mascot, clawState.stolenPosterConfigB);
          d1.boardVisible = true;
          d1.signHolderGroup.visible = true;
          d1.posterScaleCurrent = 0.45;
          d1.state = 'POSTER_SWAPPED_SHOCK';
          d1.actionTimer = 0;
          d1.reservedByHook = false;

          setMascotThoughtBubble(mascot, 'Hain?! Yeh toh doosra poster de gaya! Chalo yeh bhi chalega! 😅🪧✨', 'burst', 4.6);
          playCartoonSound('cheer_up');

          clawState.prongOpenDeg = 34;
          clawState.phase = 'RETRACT_CABLE';
          clawState.phaseTimer = 0;
          clawState.phaseDuration = 0.55;
          clawState.startCableLength = clawState.cableLength;
        }

      // ========================================================================
      // MODE A: PET KIDNAP & RELOCATION ("Oye bachaao mujhe!! 😱🪝")
      // ========================================================================
      // PHASE 1: GLIDE HORIZONTALLY TO ALIGN ABOVE TARGET PET (PET IS STILL COMPLETELY UNAWARE!)
      } else if (clawState.phase === 'ALIGN_ABOVE_PET') {
        clawState.screenX = THREE.MathUtils.lerp(clawState.startScreenX, clawState.targetScreenX, easeInOut);
        clawState.cableLength = THREE.MathUtils.lerp(clawState.startCableLength, 28, easeInOut);
        clawState.prongOpenDeg = THREE.MathUtils.lerp(14, 35, easeInOut);
        clawState.swayAngleDeg = Math.sin(p * Math.PI) * 5.0 * Math.sign(clawState.targetScreenX - clawState.startScreenX);

        if (p >= 1.0) {
          clawState.phase = 'DESCEND_CABLE';
          clawState.phaseTimer = 0;
          clawState.phaseDuration = 0.86;
          clawState.startCableLength = clawState.cableLength;
          const desiredGrabY = (originSlot ? originSlot.perchScreenY : window.innerHeight - 160) - 52;
          clawState.targetCableLength = Math.max(60, desiredGrabY - 60 - 44);
          clawState.noticeTriggered = false;
          playCartoonSound('claw_servo');
        }

      // PHASE 2: EXTEND STEEL CABLE DOWNWARD — PET ONLY NOTICES WHEN HOOK IS RIGHT OVER ITS HEAD (`p >= 0.68`)
      } else if (clawState.phase === 'DESCEND_CABLE') {
        clawState.cableLength = THREE.MathUtils.lerp(clawState.startCableLength, clawState.targetCableLength, easeInOut);
        clawState.prongOpenDeg = 35;
        clawState.swayAngleDeg = THREE.MathUtils.lerp(clawState.swayAngleDeg, 0, 0.2);

        // Realistic Notice Timing: Only when the hook has descended 68% of the way down right above the pet's head!
        if (p >= 0.68 && !clawState.noticeTriggered) {
          clawState.noticeTriggered = true;
          d1.state = 'CLAW_TARGETED';
          d1.actionTimer = 0;
          setMascotThoughtBubble(mascot, 'Hain?! Yeh hook kaha se aa gaya?! 👀', 'burst', 2.4);
          playCartoonSound('funny_boing');
        }

        if (p >= 1.0) {
          // CLAMP SHUT AROUND PET & HOIST HIGH INTO THE AIR!
          clawState.phase = 'CLAMP_AND_LIFT';
          clawState.phaseTimer = 0;
          clawState.phaseDuration = 0.90;
          clawState.startCableLength = clawState.cableLength;
          clawState.targetCableLength = 52;
          clawState.startScreenX = clawState.screenX;

          const liftOffset = originSlot && originSlot.side === 'left' ? 75 : -75;
          clawState.targetScreenX = THREE.MathUtils.clamp(
            clawState.startScreenX + liftOffset,
            150,
            window.innerWidth - 150
          );

          d1.state = 'CLAW_GRABBED';
          d1.actionTimer = 0;
          setMascotThoughtBubble(mascot, 'Oye bachaao mujhe!! 😱🪝', 'scream', 4.5);
          playCartoonSound('claw_clamp_scream');

          // Other bystander pets react to the kidnapping
          const reactions = [
            'Haha! Hook ne utha liya! 😂',
            'Oye bachaao isko! 🤣🪝',
            'Hawa mein udd gaya! 👋😂'
          ];
          mascots.forEach((other, idx) => {
            if (other !== mascot && other !== clawState.displacedMascot && other.userData.state === 'IDLE_ON_BLOCK') {
              setMascotThoughtBubble(other, reactions[idx % reactions.length], 'burst', 3.4);
            }
          });
        }

      // PHASE 3: CLAMP PRONGS TIGHT & LIFT PET HIGH INTO THE SKY
      } else if (clawState.phase === 'CLAMP_AND_LIFT') {
        clawState.prongOpenDeg = THREE.MathUtils.lerp(35, 5, Math.min(1, p * 4.5));
        clawState.cableLength = THREE.MathUtils.lerp(clawState.startCableLength, clawState.targetCableLength, easeInOut);
        clawState.screenX = THREE.MathUtils.lerp(clawState.startScreenX, clawState.targetScreenX, easeInOut);
        clawState.swayAngleDeg = Math.sin(time * 9.5) * 7.5;

        const grabScreenY = 60 + clawState.cableLength + 44;
        const grabWorld = screenPixelToWorld3D(clawState.screenX, grabScreenY);
        mascot.position.set(grabWorld.x, grabWorld.y - 0.56, grabWorld.z);

        if (p >= 1.0) {
          clawState.phase = 'MIDAIR_THRASH_AND_SCREAM';
          clawState.phaseTimer = 0;
          clawState.phaseDuration = clawState.willRelocateToOtherBlock ? 1.55 : 2.35;
          clawState.startScreenX = clawState.screenX;
          playCartoonSound('claw_clamp_scream');
        }

      // PHASE 4: DANGLING IN MID-AIR, FLAILING LEGS & SCREAMING "OYE BACHAAO MUJHE!!"
      } else if (clawState.phase === 'MIDAIR_THRASH_AND_SCREAM') {
        clawState.prongOpenDeg = 5;
        clawState.screenX = clawState.startScreenX + Math.sin(p * Math.PI * 2) * 46;
        clawState.cableLength = 52 + Math.sin(p * Math.PI * 4) * 7;
        clawState.swayAngleDeg = Math.sin(time * 12.0) * 10.5;

        if (p > 0.48 && !clawState.midScreamSwitched) {
          clawState.midScreamSwitched = true;
          setMascotThoughtBubble(mascot, 'Oye bachaao mujhe!! Niche utaaro!! 😭🪝', 'scream', 3.0);
          playCartoonSound('claw_clamp_scream');
        }

        const grabScreenY = 60 + clawState.cableLength + 44;
        const grabWorld = screenPixelToWorld3D(clawState.screenX, grabScreenY);
        mascot.position.set(grabWorld.x, grabWorld.y - 0.56, grabWorld.z);

        if (p >= 1.0) {
          if (clawState.willRelocateToOtherBlock && clawState.displacedMascot) {
            // Carry p1 across the sky to targetBlock (occupied by p2)!
            clawState.phase = 'CARRY_TO_TARGET_BLOCK';
            clawState.phaseTimer = 0;
            clawState.startScreenX = clawState.screenX;
            clawState.targetScreenX = targetSlot.perchScreenX;
            const carryDist = Math.abs(clawState.targetScreenX - clawState.startScreenX);
            clawState.phaseDuration = THREE.MathUtils.clamp(carryDist / 380, 0.85, 1.45);
            clawState.startCableLength = clawState.cableLength;
            clawState.targetCableLength = 56;
            setMascotThoughtBubble(mascot, 'Oye bachaao!! Kaha le jaa rahe ho?! 😱🪝', 'scream', 3.2);
            playCartoonSound('claw_servo');
          } else {
            // Return to origin block
            clawState.phase = 'LOWER_TO_DROP';
            clawState.phaseTimer = 0;
            clawState.phaseDuration = 0.65;
            clawState.startScreenX = clawState.screenX;
            clawState.targetScreenX = originSlot ? originSlot.perchScreenX : clawState.screenX;
            clawState.startCableLength = clawState.cableLength;
            clawState.targetCableLength = 74;
          }
        }

      // PHASE 5A (CROSS-BLOCK TRANSFER): CARRY DANGLING PET OVER TO ANOTHER PET'S BLOCK!
      } else if (clawState.phase === 'CARRY_TO_TARGET_BLOCK') {
        clawState.prongOpenDeg = 5;
        clawState.screenX = THREE.MathUtils.lerp(clawState.startScreenX, clawState.targetScreenX, easeInOut);
        clawState.cableLength = THREE.MathUtils.lerp(clawState.startCableLength, clawState.targetCableLength, easeInOut);
        const carryDir = Math.sign(clawState.targetScreenX - clawState.startScreenX) || 1;
        clawState.swayAngleDeg = Math.sin(p * Math.PI) * -9.5 * carryDir + Math.sin(time * 12) * 4.5;

        const grabScreenY = 60 + clawState.cableLength + 44;
        const grabWorld = screenPixelToWorld3D(clawState.screenX, grabScreenY);
        mascot.position.set(grabWorld.x, grabWorld.y - 0.56, grabWorld.z);

        // When the claw gets close overhead (`p >= 0.62`), the pet on targetBlock (`p2`) looks up in terror and flees!
        if (p >= 0.62 && !clawState.displacedFleeTriggered && clawState.displacedMascot) {
          clawState.displacedFleeTriggered = true;
          startScaredFleeFromHookDrop(
            clawState.displacedMascot,
            clawState.targetSlotIndex,
            clawState.originSlotIndex
          );
        }

        if (p >= 1.0) {
          clawState.phase = 'LOWER_TO_DROP';
          clawState.phaseTimer = 0;
          clawState.phaseDuration = 0.56;
          clawState.startScreenX = clawState.screenX;
          clawState.targetScreenX = targetSlot.perchScreenX;
          clawState.startCableLength = clawState.cableLength;
          const dropCableTarget = Math.max(66, (targetSlot.perchScreenY - 115) - 60 - 44);
          clawState.targetCableLength = dropCableTarget;
        }

      // PHASE 5B: LOWER SLIGHTLY OVER DESTINATION BLOCK & OPEN PRONGS TO DROP PET
      } else if (clawState.phase === 'LOWER_TO_DROP') {
        clawState.screenX = THREE.MathUtils.lerp(clawState.startScreenX, clawState.targetScreenX, easeInOut);
        clawState.cableLength = THREE.MathUtils.lerp(clawState.startCableLength, clawState.targetCableLength, easeInOut);
        clawState.swayAngleDeg = THREE.MathUtils.lerp(clawState.swayAngleDeg, 0, 0.25);

        const grabScreenY = 60 + clawState.cableLength + 44;
        const grabWorld = screenPixelToWorld3D(clawState.screenX, grabScreenY);
        mascot.position.set(grabWorld.x, grabWorld.y - 0.56, grabWorld.z);

        if (p >= 1.0) {
          clawState.prongOpenDeg = 36;
          clawState.phase = 'RETRACT_CABLE';
          clawState.phaseTimer = 0;
          clawState.phaseDuration = 0.55;
          clawState.startCableLength = clawState.cableLength;

          d1.currentSlot = clawState.targetSlotIndex;
          d1.reservedByHook = false;
          d1.state = 'CLAW_FALLING';
          d1.actionTimer = 0;
          d1.fallStartWorld = mascot.position.clone();
          d1.fallTargetWorld = targetSlot ? targetSlot.perchWorld.clone() : mascot.position.clone();
          d1.wasRelocatedByHook = clawState.willRelocateToOtherBlock;
          setMascotThoughtBubble(mascot, 'Aaaa!! Gir gaya!! 🪂', 'burst', 2.2);
          playCartoonSound('claw_drop_whistle');
        }

      // PHASE 6: RETRACT EMPTY CLAW BACK TO TOP RAIL
      } else if (clawState.phase === 'RETRACT_CABLE') {
        clawState.prongOpenDeg = THREE.MathUtils.lerp(36, 14, easeInOut);
        clawState.cableLength = THREE.MathUtils.lerp(clawState.startCableLength, 26, easeInOut);
        clawState.swayAngleDeg = 0;

        if (p >= 1.0) {
          clawState.grabbedMascot = null;
          clawState.displacedMascot = null;
          clawState.phase = 'PATROL';
          clawState.autoNextTime = time + (clawState.grabCount === 0 ? 7 : 8 + Math.random() * 2);
        }
      }

      updateClawDOMElements();
    }

    // ============================================================================
    // 6. THE 6-STAGE HILARIOUS SLAPSTICK BLOCK-TAKEOVER CHOREOGRAPHY
    // ============================================================================
    function resetMascotFacialExpression(d) {
      d.blushMat.opacity = 0.24;
      d.mouthMesh.visible = false;
      d.mouthMesh.scale.set(1, 1, 1);
      d.sadEyelids.forEach((lid) => { lid.visible = false; });
      d.eyeHolders.forEach((eh, i) => {
        eh.position.set(i === 0 ? -0.185 : 0.185, -0.025, 0.555);
        eh.scale.set(1, 1, 1);
      });
      d.eyebrows.forEach((brow) => {
        brow.position.y = brow.userData.baseY;
        brow.rotation.z = brow.userData.baseRotZ;
      });
      d.earsGroup.children.forEach((ear) => {
        if (ear.userData.baseRotZ !== undefined) {
          ear.rotation.z = ear.userData.baseRotZ;
          ear.rotation.x = 0;
        }
      });
    }

    function startInitialWalkAndClimb(mascot, delaySeconds) {
      const d = mascot.userData;
      const slot = slotPositions[d.currentSlot];
      if (!slot) return;

      const entryDistance = 3.6 + d.config.id * 1.1;
      const entryWorld = slot.floorWorld.clone();
      entryWorld.x += slot.side === 'left' ? -entryDistance : entryDistance;

      mascot.position.copy(entryWorld);
      d.posterScaleCurrent = 0.001;
      d.boardVisible = true;
      d.signHolderGroup.visible = true;
      setMascotPosterConfig(mascot, d.config);
      d.reservedByHook = false;
      d.state = 'SEQ_MOVING';
      d.wpIndex = 0;
      d.wpTimer = -delaySeconds;
      resetMascotFacialExpression(d);
      setMascotThoughtBubble(mascot, d.config.idleThoughts[0], 'normal', 4.5);

      const wps = [];
      wps.push({
        type: 'WALK_IN',
        from: entryWorld,
        to: slot.floorWorld.clone(),
        duration: 1.10 + d.config.id * 0.08
      });

      if (slot.stepWorld) {
        wps.push({
          type: 'CLIMB_STEP',
          from: slot.floorWorld.clone(),
          to: slot.stepWorld.clone(),
          duration: 0.44,
          arcHeight: 0.18
        });
        wps.push({
          type: 'CLIMB_STEP',
          from: slot.stepWorld.clone(),
          to: slot.perchWorld.clone(),
          duration: 0.48,
          arcHeight: 0.20
        });
      } else {
        wps.push({
          type: 'CLIMB_STEP',
          from: slot.floorWorld.clone(),
          to: slot.perchWorld.clone(),
          duration: 0.52,
          arcHeight: 0.22
        });
      }

      d.waypoints = wps;
    }

    function startFunnySlapAndSadSwap(mascotA, mascotB) {
      if (!mascotA || !mascotB) return;
      const dA = mascotA.userData;
      const dB = mascotB.userData;

      if (
        dA.state !== 'IDLE_ON_BLOCK' ||
        dB.state !== 'IDLE_ON_BLOCK' ||
        dA.reservedByHook ||
        dB.reservedByHook
      ) {
        return;
      }

      const slotIndexA = dA.currentSlot;
      const slotIndexB = dB.currentSlot;
      const slotA = slotPositions[slotIndexA];
      const slotB = slotPositions[slotIndexB];

      dB.state = 'WAITING_TO_BE_SLAPPED';
      resetMascotFacialExpression(dB);
      setMascotThoughtBubble(mascotB, 'Mera pyara block! 🎵', 'normal', 3.5);

      dA.state = 'STAGE1_FUNNY_STARTLE';
      dA.actionTimer = 0;
      dA.victimMascot = mascotB;
      dA.targetClaimSlot = slotIndexB;
      dA.oldSlotForVictim = slotIndexA;

      setMascotThoughtBubble(mascotA, 'AILA! Hehe! 😂', 'burst', 2.8);
      dA.blushMat.opacity = 0.92;
      dA.mouthMesh.visible = true;
      dA.mouthMesh.rotation.z = Math.PI;
      playCartoonSound('funny_boing');

      const wpsA = [];
      if (slotA.stepWorld) {
        wpsA.push({
          type: 'STAGE2_STEP_DOWN',
          from: slotA.perchWorld.clone(),
          to: slotA.stepWorld.clone(),
          duration: 0.40,
          arcHeight: 0.14
        });
        wpsA.push({
          type: 'STAGE2_STEP_DOWN',
          from: slotA.stepWorld.clone(),
          to: slotA.floorWorld.clone(),
          duration: 0.40,
          arcHeight: 0.14
        });
      } else {
        wpsA.push({
          type: 'STAGE2_STEP_DOWN',
          from: slotA.perchWorld.clone(),
          to: slotA.floorWorld.clone(),
          duration: 0.44,
          arcHeight: 0.16
        });
      }

      const floorDist = slotA.floorWorld.distanceTo(slotB.floorWorld);
      const scurryDur = THREE.MathUtils.clamp(floorDist * 0.12, 0.85, 1.55);
      wpsA.push({
        type: 'STAGE3_SCURRY_FLOOR',
        from: slotA.floorWorld.clone(),
        to: slotB.floorWorld.clone(),
        duration: scurryDur
      });

      if (slotB.stepWorld) {
        wpsA.push({
          type: 'STAGE3_CLIMB_TARGET',
          from: slotB.floorWorld.clone(),
          to: slotB.stepWorld.clone(),
          duration: 0.42,
          arcHeight: 0.18
        });
        wpsA.push({
          type: 'STAGE3_CLIMB_TARGET',
          from: slotB.stepWorld.clone(),
          to: slotB.attackLedgeWorld.clone(),
          duration: 0.44,
          arcHeight: 0.20,
          beginWindupSlapAtEnd: true
        });
      } else {
        wpsA.push({
          type: 'STAGE3_CLIMB_TARGET',
          from: slotB.floorWorld.clone(),
          to: slotB.attackLedgeWorld.clone(),
          duration: 0.48,
          arcHeight: 0.22,
          beginWindupSlapAtEnd: true
        });
      }

      dA.waypoints = wpsA;
      dA.wpIndex = 0;
      dA.wpTimer = 0;
    }

    function knockVictimOffBlockAndStartSadWalk(victimMascot, fromSlotIndex, destSlotIndex) {
      const dB = victimMascot.userData;
      const fromSlot = slotPositions[fromSlotIndex];
      const destSlot = slotPositions[destSlotIndex];

      dB.currentSlot = destSlotIndex;
      dB.state = 'STAGE4_VICTIM_SPIN';
      dB.actionTimer = 0;
      dB.blushMat.opacity = 0.95;
      dB.mouthMesh.visible = true;
      dB.mouthMesh.rotation.z = 0;

      setMascotThoughtBubble(victimMascot, 'Aiyyo! 💫', 'burst', 2.8);

      const wpsB = [];
      wpsB.push({
        type: 'STAGE4_TUMBLE_OFF_BLOCK',
        from: fromSlot.perchWorld.clone(),
        to: fromSlot.floorWorld.clone(),
        duration: 0.54,
        arcHeight: 0.24
      });

      wpsB.push({
        type: 'STAGE6_RUB_CHEEK_SAD',
        from: fromSlot.floorWorld.clone(),
        to: fromSlot.floorWorld.clone(),
        duration: 0.88
      });

      const sadDist = fromSlot.floorWorld.distanceTo(destSlot.floorWorld);
      const sadWalkDur = THREE.MathUtils.clamp(sadDist * 0.23, 1.75, 2.90);
      wpsB.push({
        type: 'STAGE6_SAD_WALK_FLOOR',
        from: fromSlot.floorWorld.clone(),
        to: destSlot.floorWorld.clone(),
        duration: sadWalkDur
      });

      if (destSlot.stepWorld) {
        wpsB.push({
          type: 'STAGE6_SAD_CLIMB_STEP',
          from: destSlot.floorWorld.clone(),
          to: destSlot.stepWorld.clone(),
          duration: 0.60,
          arcHeight: 0.16
        });
        wpsB.push({
          type: 'STAGE6_SAD_CLIMB_STEP',
          from: destSlot.stepWorld.clone(),
          to: destSlot.perchWorld.clone(),
          duration: 0.62,
          arcHeight: 0.18,
          cheerUpAtEnd: true
        });
      } else {
        wpsB.push({
          type: 'STAGE6_SAD_CLIMB_STEP',
          from: destSlot.floorWorld.clone(),
          to: destSlot.perchWorld.clone(),
          duration: 0.65,
          arcHeight: 0.20,
          cheerUpAtEnd: true
        });
      }

      dB.waypoints = wpsB;
      dB.wpIndex = 0;
      dB.wpTimer = 0;
    }

    function scareAndSwapFromMascot(mascotIndex) {
      const targetMascot = mascots[mascotIndex];
      if (!targetMascot) return;

      const candidates = mascots.filter(
        (m, idx) =>
          idx !== mascotIndex &&
          m.userData.state === 'IDLE_ON_BLOCK' &&
          !m.userData.reservedByHook &&
          m.userData.boardVisible !== false
      );

      if (
        targetMascot.userData.state === 'IDLE_ON_BLOCK' &&
        !targetMascot.userData.reservedByHook &&
        targetMascot.userData.boardVisible !== false &&
        candidates.length > 0
      ) {
        const partner = candidates[Math.floor(Math.random() * candidates.length)];
        startFunnySlapAndSadSwap(targetMascot, partner);
      }
    }

    function replayClimbIn(e) {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      if (flyingPosterGroup) flyingPosterGroup.visible = false;
      clawState.phase = 'PATROL';
      clawState.grabbedMascot = null;
      clawState.displacedMascot = null;
      updateClawDOMElements();

      computeSlotWorldCoordinates();
      mascots.forEach((m, idx) => {
        m.userData.currentSlot = idx;
        m.userData.reservedByHook = false;
        startInitialWalkAndClimb(m, 0.08 + idx * 0.16);
      });
    }

    window.triggerClawGrabSequence = triggerClawGrabSequence;
    window.triggerClawPosterStealSequence = triggerClawPosterStealSequence;
    window.replayClimbIn = replayClimbIn;

    // ============================================================================
    // 7. INITIALIZE 100% TRANSPARENT THREE.JS SCENE & 5-LIGHT VELVET STUDIO RIG
    // ============================================================================
    function initThreeScene() {
      const canvas = document.getElementById('webgl-canvas');
      if (!canvas) return;

      scene = new THREE.Scene();
      scene.background = null;

      const viewport = getHeroViewport();
      camera = new THREE.PerspectiveCamera(
        42,
        viewport.width / viewport.height,
        0.1,
        100
      );
      camera.position.set(0, 0, 9.2);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld(true);

      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(viewport.width, viewport.height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.outputEncoding = THREE.sRGBEncoding;

      // 5-Light Velvet Studio Rig
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0xf7eef5, 0.95);
      hemiLight.position.set(0, 15, 0);
      scene.add(hemiLight);

      const keyLight = new THREE.DirectionalLight(0xfff9fc, 1.05);
      keyLight.position.set(5, 11, 8.5);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xf0f9ff, 0.55);
      fillLight.position.set(-6, 5, 6);
      scene.add(fillLight);

      const rimLightLeft = new THREE.PointLight(0xffd6e5, 0.9, 25);
      rimLightLeft.position.set(-7, 6, -4);
      scene.add(rimLightLeft);

      const rimLightRight = new THREE.PointLight(0xc7f9cc, 0.9, 25);
      rimLightRight.position.set(7, 6, -4);
      scene.add(rimLightRight);

      velvetFurMaps = createMicroVelvetFurMaps();
      shadowTexture = createSoftContactShadowTexture();

      MASCOT_CONFIGS.forEach((cfg) => {
        const mascot = createVelvetMascot3D(cfg);
        scene.add(mascot);
        mascots.push(mascot);
      });

      flyingPosterGroup = createFlyingClawPoster3D();
      scene.add(flyingPosterGroup);

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          MASCOT_CONFIGS.forEach((cfg) => {
            posterTextureCache[cfg.key] = drawCleanWhiteMarkerPosterTexture(cfg);
          });
          mascots.forEach((m) => {
            const activeCfg = m.userData.heldPosterConfig || m.userData.config;
            m.userData.posterFaceMat.map = posterTextureCache[activeCfg.key];
            m.userData.posterFaceMat.needsUpdate = true;
          });
        });
      }

      window.setTimeout(() => {
        computeSlotWorldCoordinates();
        mascots.forEach((m, idx) => {
          m.userData.currentSlot = idx;
          startInitialWalkAndClimb(m, 0.12 + idx * 0.18);
        });
      }, 900);

      window.addEventListener('resize', onWindowResize);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('click', onClickMascot);
      window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          onPointerDownScreen(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });
    }

    function onWindowResize() {
      if (!camera || !renderer) return;
      const viewport = getHeroViewport();
      camera.aspect = viewport.width / viewport.height;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld(true);
      renderer.setSize(viewport.width, viewport.height, false);
      computeSlotWorldCoordinates();

      mascots.forEach((m) => {
        if (m.userData.state === 'IDLE_ON_BLOCK') {
          const slot = slotPositions[m.userData.currentSlot];
          if (slot) m.position.copy(slot.perchWorld);
        }
      });
    }

    function onMouseMove(e) {
      const viewport = getHeroViewport();
      mouse.x = ((e.clientX - viewport.left) / viewport.width) * 2 - 1;
      mouse.y = -((e.clientY - viewport.top) / viewport.height) * 2 + 1;
    }

    function onPointerDownScreen(clientX, clientY) {
      const viewport = getHeroViewport();
      const rx = ((clientX - viewport.left) / viewport.width) * 2 - 1;
      const ry = -((clientY - viewport.top) / viewport.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(rx, ry), camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, true);

      if (hits.length > 0) {
        let rootObj = hits[0].object;
        while (rootObj.parent && rootObj.userData.id === undefined && rootObj !== scene) {
          rootObj = rootObj.parent;
        }
        if (rootObj && rootObj.userData.id !== undefined) {
          getAudioCtx();
          scareAndSwapFromMascot(rootObj.userData.id);
        }
      }
    }

    function onClickMascot(e) {
      if (e.target && (e.target.closest('button') || e.target.closest('#claw-rig'))) return;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, true);

      if (hits.length > 0) {
        let rootObj = hits[0].object;
        while (rootObj.parent && rootObj.userData.id === undefined && rootObj !== scene) {
          rootObj = rootObj.parent;
        }
        if (rootObj && rootObj.userData.id !== undefined) {
          getAudioCtx();
          scareAndSwapFromMascot(rootObj.userData.id);
        }
      }
    }

    // ============================================================================
    // 8. ANIMATION LOOP, CLAW HOOK RELOCATION & 6-STAGE SLAPSTICK ACTING
    // ============================================================================
    function animate() {
      requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      smoothMouse.lerp(mouse, 0.08);
      updateDustParticles(delta);
      updateClawHookMachine(delta, time);

      // NOTE: Slap sequence ONLY triggers on direct user click on a 3D pet!
      // Automatic idle events are handled exclusively by the top mechanical claw hook.

      let anyPetHovered = false;

      mascots.forEach((mascot) => {
        const d = mascot.userData;
        const bodyPivot = d.bodyPivot;
        const headGroup = d.headGroup;
        const leftArmPivot = d.leftArmPivot;
        const rightArmPivot = d.rightArmPivot;
        const leftLegGroup = d.leftLegGroup;
        const rightLegGroup = d.rightLegGroup;
        const signHolderGroup = d.signHolderGroup;
        const shadowMesh = d.shadowMesh;

        if (d.tailPivot) {
          d.tailPivot.rotation.z = Math.sin(time * 6.5 + d.id) * 0.22;
        }

        // Lifelike Double-Blinks & Independent Ear Twitches
        if (d.state === 'IDLE_ON_BLOCK' || d.state === 'WAITING_TO_BE_SLAPPED') {
          d.blinkTimer -= delta;
          if (d.blinkTimer <= 0 && d.blinkPhase === 0) {
            d.blinkPhase = 0.001;
            d.isDoubleBlink = Math.random() < 0.42;
          }
          if (d.blinkPhase > 0) {
            d.blinkPhase += delta;
            const totalBlinkDur = d.isDoubleBlink ? 0.34 : 0.16;
            const pulse = Math.sin((d.blinkPhase / 0.16) * Math.PI);
            const squashY = Math.max(0.08, 1.0 - Math.abs(pulse) * 0.92);
            d.eyeHolders.forEach((eh) => {
              eh.scale.set(1.04, squashY, 1.0);
            });
            if (d.blinkPhase >= totalBlinkDur) {
              d.blinkPhase = 0;
              d.blinkTimer = 2.4 + Math.random() * 3.8;
              d.eyeHolders.forEach((eh) => eh.scale.set(1, 1, 1));
            }
          }

          d.earTwitchTimer -= delta;
          if (d.earTwitchTimer <= 0 && d.earTwitchPhase === 0) {
            d.earTwitchPhase = 0.001;
            d.earTwitchSide = Math.random() < 0.5 ? 0 : 1;
          }
          if (d.earTwitchPhase > 0) {
            d.earTwitchPhase += delta;
            const earObj = d.earsGroup.children[d.earTwitchSide];
            if (earObj && earObj.userData.baseRotZ !== undefined) {
              const twitchKick = Math.sin((d.earTwitchPhase / 0.22) * Math.PI * 2) * 0.18;
              earObj.rotation.z = earObj.userData.baseRotZ + twitchKick;
            }
            if (d.earTwitchPhase >= 0.22) {
              if (earObj && earObj.userData.baseRotZ !== undefined) {
                earObj.rotation.z = earObj.userData.baseRotZ;
              }
              d.earTwitchPhase = 0;
              d.earTwitchTimer = 2.2 + Math.random() * 4.0;
            }
          }
        }

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([d.torsoMesh, d.headGroup.children[0]], true);
        d.hovered = intersects.length > 0;
        if (d.hovered) anyPetHovered = true;

        if (d.slapImpactMat.opacity > 0.01) {
          d.slapImpactMat.opacity -= delta * 2.4;
          d.slapImpactMesh.scale.addScalar(delta * 3.5);
          d.slapImpactMesh.rotation.z += delta * 6.0;
        }

        // ======================================================================
        // CLAW HOOK STATE 1: HOOK IS RIGHT OVER PET'S HEAD (`t >= 0.68` of DESCEND)
        // ======================================================================
        if (d.state === 'CLAW_TARGETED') {
          d.actionTimer += delta;
          headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, -0.52, 0.28);
          headGroup.rotation.y = Math.sin(time * 22) * 0.16;
          bodyPivot.position.y = Math.abs(Math.sin(d.actionTimer * 24)) * 0.08;
          d.eyebrows.forEach((brow) => {
            brow.position.y = brow.userData.baseY + 0.06;
            brow.rotation.z = brow.userData.sideSign * -0.32;
          });
          d.eyeHolders.forEach((eh) => {
            eh.scale.set(1.24, 1.24, 1.0);
          });
          d.posterScaleCurrent = THREE.MathUtils.lerp(d.posterScaleCurrent, 0.52, 0.22);
          shadowMesh.material.opacity = 0.30;

        // ======================================================================
        // CLAW HOOK STATE 2: GRABBED & LIFTED IN MID-AIR ("Oye bachaao mujhe!! 😱🪝")
        // ======================================================================
        } else if (d.state === 'CLAW_GRABBED') {
          d.actionTimer += delta;
          const panicCycle = time * 28.0;

          d.blushMat.opacity = 0.95;
          d.mouthMesh.visible = true;
          d.mouthMesh.rotation.z = 0;
          d.mouthMesh.scale.set(1.25, 1.35 + Math.sin(panicCycle) * 0.25, 1.0);

          d.eyebrows.forEach((brow) => {
            brow.position.y = brow.userData.baseY + 0.065;
            brow.rotation.z = brow.userData.sideSign * -0.38;
          });

          d.eyeHolders.forEach((eh, i) => {
            eh.position.x = (i === 0 ? -0.175 : 0.175) + Math.sin(panicCycle + i) * 0.015;
            eh.scale.set(1.28, 1.28, 1.0);
          });

          d.earsGroup.children.forEach((ear) => {
            const s = ear.userData.side || 1;
            ear.rotation.z = (ear.userData.baseRotZ || 0) + Math.sin(panicCycle * 0.9) * 0.26 * s;
          });

          bodyPivot.position.y = 0;
          bodyPivot.rotation.z = THREE.MathUtils.degToRad(-clawState.swayAngleDeg * 1.35) + Math.sin(panicCycle * 0.5) * 0.12;
          bodyPivot.rotation.x = Math.sin(panicCycle * 0.4) * 0.14;
          headGroup.rotation.x = -0.15 + Math.sin(panicCycle * 0.6) * 0.12;
          headGroup.rotation.y = Math.sin(panicCycle * 0.45) * 0.24;

          leftLegGroup.rotation.x = Math.sin(panicCycle) * 0.78;
          rightLegGroup.rotation.x = -Math.sin(panicCycle) * 0.78;
          leftLegGroup.rotation.z = -0.18 + Math.cos(panicCycle) * 0.15;
          rightLegGroup.rotation.z = 0.18 - Math.cos(panicCycle) * 0.15;

          leftArmPivot.rotation.set(-2.35 + Math.sin(panicCycle) * 0.45, 0, 0.38);
          rightArmPivot.rotation.set(-2.35 - Math.sin(panicCycle) * 0.45, 0, -0.38);

          d.posterScaleCurrent = THREE.MathUtils.lerp(d.posterScaleCurrent, 0.36, 0.18);
          shadowMesh.material.opacity = 0.04;

        // ======================================================================
        // CLAW HOOK STATE 3: RELEASED & FALLING ONTO DESTINATION BLOCK
        // ======================================================================
        } else if (d.state === 'CLAW_FALLING') {
          d.actionTimer += delta;
          const fallDur = 0.46;
          const p = Math.min(d.actionTimer / fallDur, 1.0);
          const easeIn = p * p;

          mascot.position.lerpVectors(d.fallStartWorld, d.fallTargetWorld, easeIn);
          bodyPivot.rotation.z = THREE.MathUtils.lerp(bodyPivot.rotation.z, 0, 0.2);
          bodyPivot.rotation.x = THREE.MathUtils.lerp(bodyPivot.rotation.x, 0, 0.2);
          leftLegGroup.rotation.x = Math.sin(time * 30) * 0.4;
          rightLegGroup.rotation.x = -Math.sin(time * 30) * 0.4;
          shadowMesh.material.opacity = THREE.MathUtils.lerp(0.04, 0.30, easeIn);

          if (p >= 1.0) {
            mascot.position.copy(d.fallTargetWorld);
            resetMascotFacialExpression(d);
            d.state = 'IDLE_ON_BLOCK';
            if (d.wasRelocatedByHook) {
              setMascotThoughtBubble(mascot, 'Hain?! Main doosre block par aa gaya! 😮✨', 'normal', 4.2);
            } else {
              setMascotThoughtBubble(mascot, 'Shukar hai! Bach gaya! 😮‍💨💫', 'normal', 4.0);
            }
            playCartoonSound('funny_boing');
            spawnFloorDustPuff(mascot.position);
          }

        // ======================================================================
        // CLAW HOOK STATE 4: DISPLACED PET (`p2`) STARTLED BY INCOMING HOOK DROP
        // ======================================================================
        } else if (d.state === 'SCARED_BY_HOOK_DROP') {
          d.actionTimer += delta;
          const t = d.actionTimer;

          headGroup.rotation.x = -0.45;
          bodyPivot.position.y = Math.abs(Math.sin(t * 28)) * 0.12;
          bodyPivot.rotation.z = Math.sin(t * 26) * 0.16;
          leftArmPivot.rotation.set(-2.35, 0, 0.45);
          rightArmPivot.rotation.set(-2.35, 0, -0.45);

          d.eyebrows.forEach((brow) => {
            brow.position.y = brow.userData.baseY + 0.06;
            brow.rotation.z = brow.userData.sideSign * -0.35;
          });
          d.eyeHolders.forEach((eh) => eh.scale.set(1.26, 1.26, 1.0));
          d.posterScaleCurrent = THREE.MathUtils.lerp(d.posterScaleCurrent, 0.36, 0.25);

          if (t >= 0.24) {
            d.state = 'SEQ_MOVING';
          }

        // ======================================================================
        // POSTER STEAL STATE 1: PET LOOKS UP AS HOOK DESCENDS TOWARD ITS POSTER
        // ======================================================================
        } else if (d.state === 'POSTER_TARGETED_LOOK_UP') {
          d.actionTimer += delta;
          headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, -0.48, 0.25);
          headGroup.rotation.y = Math.sin(time * 20) * 0.14;
          bodyPivot.position.y = Math.abs(Math.sin(d.actionTimer * 22)) * 0.06;
          d.eyebrows.forEach((brow) => {
            brow.position.y = brow.userData.baseY + 0.055;
            brow.rotation.z = brow.userData.sideSign * -0.30;
          });
          d.eyeHolders.forEach((eh) => eh.scale.set(1.22, 1.22, 1.0));
          d.posterScaleCurrent = THREE.MathUtils.lerp(d.posterScaleCurrent, 1.0, 0.2);

        // ======================================================================
        // POSTER STEAL STATE 2: EMPTY-HANDED PET JUMPS & WAVES ARMS ("Oye mera poster waapis de!! 😡🪧")
        // ======================================================================
        } else if (d.state === 'POSTER_STOLEN_TANTRUM') {
          d.actionTimer += delta;
          const tantrumCycle = time * 24.0;

          d.signHolderGroup.visible = false;
          d.blushMat.opacity = 0.92;
          d.mouthMesh.visible = true;
          d.mouthMesh.rotation.z = 0;
          d.mouthMesh.scale.set(1.20, 1.25 + Math.sin(tantrumCycle) * 0.22, 1.0);

          // Furrowed angry/frustrated eyebrows
          d.eyebrows.forEach((brow) => {
            brow.position.y = brow.userData.baseY - 0.015;
            brow.rotation.z = brow.userData.sideSign * 0.42;
          });

          // Look up toward the flying claw hook
          const lookDir = Math.sign((clawState.screenX / window.innerWidth - 0.5) * 2) * 0.22;
          headGroup.rotation.x = -0.42 + Math.sin(tantrumCycle * 0.5) * 0.10;
          headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, lookDir, 0.2);

          // Comedic jumping up and down on the block
          bodyPivot.position.y = Math.abs(Math.sin(tantrumCycle * 0.85)) * 0.15;
          bodyPivot.rotation.z = Math.sin(tantrumCycle * 0.85) * 0.12;

          // Wave both empty arms high at the sky demanding the poster back
          leftArmPivot.rotation.set(-2.45 + Math.sin(tantrumCycle) * 0.52, 0, 0.35 + Math.cos(tantrumCycle) * 0.18);
          rightArmPivot.rotation.set(-2.45 - Math.sin(tantrumCycle) * 0.52, 0, -0.35 - Math.cos(tantrumCycle) * 0.18);

          leftLegGroup.rotation.x = Math.sin(tantrumCycle * 0.85) * 0.35;
          rightLegGroup.rotation.x = -Math.sin(tantrumCycle * 0.85) * 0.35;

        // ======================================================================
        // POSTER STEAL STATE 3: PET REACTS TO EXCHANGED POSTER ("Arre!! Mera poster badal ke doosre ka de diya!! 😂🪧")
        // ======================================================================
        } else if (d.state === 'POSTER_SWAPPED_SHOCK') {
          d.actionTimer += delta;
          const t = d.actionTimer;

          d.signHolderGroup.visible = true;
          d.boardVisible = true;
          d.posterScaleCurrent = THREE.MathUtils.lerp(d.posterScaleCurrent, 1.08, 0.22);

          // Look up at the newly swapped poster in disbelief / amusement
          headGroup.rotation.x = -0.38;
          headGroup.rotation.y = Math.sin(t * 18.0) * 0.22;
          bodyPivot.position.y = Math.abs(Math.sin(t * 14.0)) * 0.09;
          bodyPivot.rotation.z = Math.sin(t * 12.0) * 0.08;

          d.eyebrows.forEach((brow) => {
            brow.position.y = brow.userData.baseY + 0.055;
            brow.rotation.z = brow.userData.sideSign * -0.28;
          });
          d.eyeHolders.forEach((eh) => eh.scale.set(1.20, 1.20, 1.0));

          leftArmPivot.rotation.set(-2.18, 0, 0.14);
          rightArmPivot.rotation.set(-2.18, 0, -0.14);

          if (t >= 1.45) {
            resetMascotFacialExpression(d);
            d.state = 'IDLE_ON_BLOCK';
          }

        // ======================================================================
        // SLAPSTICK STAGE 1: FUNNY STARTLE ("AILA! Hehe! 😂")
        // ======================================================================
        } else if (d.state === 'STAGE1_FUNNY_STARTLE') {
          d.actionTimer += delta;
          const t = d.actionTimer;

          d.eyebrows.forEach((brow) => {
            brow.position.y = brow.userData.baseY + 0.055;
            brow.rotation.z = brow.userData.sideSign * -0.32;
          });

          d.earsGroup.children.forEach((ear) => {
            const s = ear.userData.side || 1;
            ear.rotation.z = s * -0.05 + Math.sin(t * 28) * 0.18;
          });

          d.eyeHolders.forEach((eh, i) => {
            const inwardX = i === 0 ? -0.115 : 0.115;
            eh.position.x = THREE.MathUtils.lerp(eh.position.x, inwardX, 0.25);
            eh.position.y = -0.02 + Math.sin(t * 32 + i * Math.PI) * 0.025;
            const bounceScale = 1.18 + Math.sin(t * 26) * 0.14;
            eh.scale.set(bounceScale, bounceScale, 1);
          });

          bodyPivot.position.y = Math.abs(Math.sin(t * 18)) * 0.09;
          bodyPivot.rotation.z = Math.sin(t * 16) * 0.14;
          bodyPivot.rotation.x = 0;
          leftLegGroup.rotation.z = 0.18 * Math.sin(t * 20);
          rightLegGroup.rotation.z = -0.18 * Math.sin(t * 20);

          leftArmPivot.rotation.set(-1.35 + Math.sin(t * 24) * 0.22, 0, -0.38);
          rightArmPivot.rotation.set(-1.35 - Math.sin(t * 24) * 0.22, 0, 0.38);

          d.posterScaleCurrent = THREE.MathUtils.lerp(d.posterScaleCurrent, 0.55, 0.15);

          if (t > 0.95) {
            resetMascotFacialExpression(d);
            setMascotThoughtBubble(mascot, 'Ruk abhi batata hu! 😤', 'burst', 3.0);
            d.state = 'SEQ_MOVING';
          }

        // SLAPSTICK STAGE 4A: ATTACKER WINDS UP RIGHT PLUSH ARM & SLAPS!
        } else if (d.state === 'STAGE4_SLAP_WINDUP') {
          d.actionTimer += delta;
          const t = d.actionTimer;
          const victim = d.victimMascot;
          const dirToVictim = victim ? Math.sign(victim.position.x - mascot.position.x) || 1 : 1;

          d.eyebrows.forEach((brow) => {
            brow.position.y = brow.userData.baseY - 0.015;
            brow.rotation.z = brow.userData.sideSign * 0.38;
          });

          d.facingYaw = THREE.MathUtils.lerp(d.facingYaw, dirToVictim * 0.35, 0.25);
          d.posterScaleCurrent = THREE.MathUtils.lerp(d.posterScaleCurrent, 0.35, 0.2);

          if (t < 0.28) {
            bodyPivot.rotation.y = -dirToVictim * 0.45;
            rightArmPivot.rotation.set(-0.9, 0, -1.35);
          } else if (t < 0.55) {
            bodyPivot.rotation.y = dirToVictim * 0.55;
            rightArmPivot.rotation.set(-1.25, 0, 1.15);

            if (!d.slapConnected) {
              d.slapConnected = true;
              playCartoonSound('slap_pataak');

              setMascotThoughtBubble(mascot, 'PATAAK! 👋💥', 'burst', 2.8);
              d.slapImpactMat.opacity = 1.0;
              d.slapImpactMesh.scale.setScalar(0.5);

              if (victim) {
                knockVictimOffBlockAndStartSadWalk(victim, d.targetClaimSlot, d.oldSlotForVictim);
              }
            }
          } else {
            d.slapConnected = false;
            d.currentSlot = d.targetClaimSlot;
            const targetPerch = slotPositions[d.targetClaimSlot].perchWorld;
            d.waypoints = [{
              type: 'STAGE5_CLAIM_CENTER',
              from: mascot.position.clone(),
              to: targetPerch.clone(),
              duration: 0.38,
              arcHeight: 0.14
            }];
            d.wpIndex = 0;
            d.wpTimer = 0;
            resetMascotFacialExpression(d);
            setMascotThoughtBubble(mascot, 'Mera Block! 😎', 'normal', 3.4);
            d.state = 'SEQ_MOVING';
          }

        // SLAPSTICK STAGE 4B: VICTIM SPINS ON BLOCK BEFORE TUMBLING OFF
        } else if (d.state === 'STAGE4_VICTIM_SPIN') {
          d.actionTimer += delta;
          const t = d.actionTimer;

          bodyPivot.rotation.y = t * 18.0;
          bodyPivot.position.y = Math.sin(t * 20) * 0.12;
          leftArmPivot.rotation.set(-1.5, 0, 0.6);
          rightArmPivot.rotation.set(-1.5, 0, -0.6);
          d.posterScaleCurrent = THREE.MathUtils.lerp(d.posterScaleCurrent, 0.35, 0.2);

          if (t > 0.34) {
            bodyPivot.rotation.y = 0;
            d.state = 'SEQ_MOVING';
          }

        // WAYPOINT MOVEMENT ENGINE (INCLUDES SCARED FLEE RUN & SLAPSTICK STAGES)
        } else if (d.state === 'SEQ_MOVING') {
          d.wpTimer += delta;
          if (d.wpTimer < 0) return;

          const wp = d.waypoints[d.wpIndex];
          if (!wp) {
            d.state = 'IDLE_ON_BLOCK';
            return;
          }

          let progress = Math.min(d.wpTimer / wp.duration, 1.0);
          const easeT = 0.5 - 0.5 * Math.cos(progress * Math.PI);
          mascot.position.lerpVectors(wp.from, wp.to, easeT);

          if (wp.arcHeight) {
            mascot.position.y += Math.sin(progress * Math.PI) * wp.arcHeight;
          }

          const moveDir = new THREE.Vector3().subVectors(wp.to, wp.from);
          if (Math.abs(moveDir.x) > 0.01) {
            const targetYaw = moveDir.x > 0 ? 0.28 : -0.28;
            d.facingYaw = THREE.MathUtils.lerp(d.facingYaw, targetYaw, 0.16);
          }

          // SCARED FLEE ACROSS FLOOR WHEN HOOK DROPS ANOTHER PET ON ITS BLOCK ("darr ke bhaag ke")
          if (wp.type === 'SCARED_FLEE_STEP_DOWN' || wp.type === 'SCARED_FLEE_FLOOR_RUN' || wp.type === 'SCARED_FLEE_CLIMB_UP') {
            if (wp.type === 'SCARED_FLEE_FLOOR_RUN' && !wp.runBubbleShown) {
              wp.runBubbleShown = true;
              setMascotThoughtBubble(mascot, 'Mummy re! Bhaago yaha se!! 😱💨', 'scream', 2.6);
            }

            const panicRunCycle = time * 26.0;
            bodyPivot.position.y = Math.abs(Math.sin(panicRunCycle)) * 0.12;
            bodyPivot.rotation.z = Math.sin(panicRunCycle) * 0.14;
            bodyPivot.rotation.x = 0.16;
            headGroup.rotation.x = -0.15;
            leftLegGroup.rotation.x = Math.sin(panicRunCycle) * 0.78;
            rightLegGroup.rotation.x = -Math.sin(panicRunCycle) * 0.78;
            leftArmPivot.rotation.set(-2.15 + Math.sin(panicRunCycle) * 0.55, 0, 0.35);
            rightArmPivot.rotation.set(-2.15 - Math.sin(panicRunCycle) * 0.55, 0, -0.35);
            d.posterScaleCurrent = THREE.MathUtils.lerp(d.posterScaleCurrent, 0.36, 0.18);

            d.dustSpawnTimer += delta;
            if (d.dustSpawnTimer > 0.08) {
              d.dustSpawnTimer = 0;
              spawnFloorDustPuff(mascot.position);
            }

          } else if (wp.type === 'STAGE3_SCURRY_FLOOR') {
            d.eyebrows.forEach((brow) => {
              brow.position.y = brow.userData.baseY - 0.01;
              brow.rotation.z = brow.userData.sideSign * 0.34;
            });

            const scurryCycle = time * 22;
            bodyPivot.position.y = Math.abs(Math.sin(scurryCycle)) * 0.10;
            bodyPivot.rotation.z = Math.sin(scurryCycle) * 0.11;
            bodyPivot.rotation.x = 0.10;
            leftLegGroup.rotation.x = Math.sin(scurryCycle) * 0.65;
            rightLegGroup.rotation.x = -Math.sin(scurryCycle) * 0.65;
            leftArmPivot.rotation.x = -0.8 + Math.sin(scurryCycle) * 0.55;
            rightArmPivot.rotation.x = -0.8 - Math.sin(scurryCycle) * 0.55;
            d.posterScaleCurrent = THREE.MathUtils.lerp(d.posterScaleCurrent, 0.42, 0.15);

            d.dustSpawnTimer += delta;
            if (d.dustSpawnTimer > 0.11) {
              d.dustSpawnTimer = 0;
              spawnFloorDustPuff(mascot.position);
            }

          } else if (wp.type === 'STAGE4_TUMBLE_OFF_BLOCK') {
            const bounce = Math.abs(Math.sin(progress * Math.PI * 2.5)) * (1.0 - progress) * 0.20;
            bodyPivot.position.y = bounce;
            bodyPivot.rotation.z = Math.sin(progress * Math.PI * 2) * 0.35;
            d.posterScaleCurrent = THREE.MathUtils.lerp(d.posterScaleCurrent, 0.35, 0.15);

          } else if (wp.type === 'STAGE6_RUB_CHEEK_SAD') {
            if (!wp.soundPlayed) {
              wp.soundPlayed = true;
              playCartoonSound('sad_walk');
              setMascotThoughtBubble(mascot, 'Hurt ho gaya 🥺💧', 'sad', 3.6);
              d.sadEyelids.forEach((lid) => { lid.visible = true; });
              d.mouthMesh.visible = true;
              d.mouthMesh.rotation.z = 0;
            }
            d.eyebrows.forEach((brow) => {
              brow.position.y = brow.userData.baseY + 0.015;
              brow.rotation.z = brow.userData.sideSign * -0.36;
            });

            bodyPivot.rotation.x = THREE.MathUtils.lerp(bodyPivot.rotation.x, 0.34, 0.15);
            headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, 0.48, 0.15);
            headGroup.rotation.z = Math.sin(time * 8) * 0.12;
            leftArmPivot.rotation.set(-1.35 + Math.sin(time * 14) * 0.15, 0, -0.35);
            rightArmPivot.rotation.set(-0.3, 0, -0.2);
            d.posterScaleCurrent = THREE.MathUtils.lerp(d.posterScaleCurrent, 0.35, 0.15);

          } else if (wp.type === 'STAGE6_SAD_WALK_FLOOR' || wp.type === 'STAGE6_SAD_CLIMB_STEP') {
            const sadStepCycle = time * 6.5;
            bodyPivot.position.y = Math.abs(Math.sin(sadStepCycle)) * 0.038;
            bodyPivot.rotation.x = THREE.MathUtils.lerp(bodyPivot.rotation.x, 0.38, 0.15);
            bodyPivot.rotation.z = Math.sin(sadStepCycle) * 0.09;

            headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, 0.56, 0.15);
            headGroup.rotation.y = Math.sin(sadStepCycle * 0.5) * 0.12;

            d.eyebrows.forEach((brow) => {
              brow.position.y = brow.userData.baseY + 0.015;
              brow.rotation.z = brow.userData.sideSign * -0.36;
            });

            d.earsGroup.children.forEach((ear) => {
              const s = ear.userData.side || 1;
              ear.rotation.z = s * 0.55;
              ear.rotation.x = 0.35;
            });

            d.sadEyelids.forEach((lid) => { lid.visible = true; });
            d.mouthMesh.visible = true;
            d.mouthMesh.position.y = -0.21 + Math.sin(time * 22) * 0.006;

            leftArmPivot.rotation.set(-0.25 + Math.sin(sadStepCycle) * 0.22, 0, 0.12);
            rightArmPivot.rotation.set(-0.25 - Math.sin(sadStepCycle) * 0.22, 0, -0.12);
            leftLegGroup.rotation.x = Math.sin(sadStepCycle) * 0.35;
            rightLegGroup.rotation.x = -Math.sin(sadStepCycle) * 0.35;
            d.posterScaleCurrent = THREE.MathUtils.lerp(d.posterScaleCurrent, 0.32, 0.12);

          } else {
            const walkCycle = time * 13;
            bodyPivot.position.y = Math.abs(Math.sin(walkCycle)) * 0.08;
            bodyPivot.rotation.z = Math.sin(walkCycle) * 0.07;
            bodyPivot.rotation.x = THREE.MathUtils.lerp(bodyPivot.rotation.x, 0, 0.15);
            headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, 0, 0.15);
            leftLegGroup.rotation.x = Math.sin(walkCycle) * 0.45;
            rightLegGroup.rotation.x = -Math.sin(walkCycle) * 0.45;
            leftArmPivot.rotation.x = -1.2 + Math.sin(walkCycle) * 0.35;
            rightArmPivot.rotation.x = -1.2 - Math.sin(walkCycle) * 0.35;
            d.posterScaleCurrent = THREE.MathUtils.lerp(d.posterScaleCurrent, 0.52, 0.12);
          }

          if (progress >= 1.0) {
            mascot.position.copy(wp.to);

            if (wp.beginWindupSlapAtEnd) {
              d.state = 'STAGE4_SLAP_WINDUP';
              d.actionTimer = 0;
              d.slapConnected = false;
              return;
            }

            if (wp.cheerUpAtEnd) {
              resetMascotFacialExpression(d);
              setMascotThoughtBubble(mascot, 'Chalo koi nahi! 😊', 'normal', 3.5);
              playCartoonSound('cheer_up');
            }

            if (wp.safeOnNewBlockAtEnd) {
              resetMascotFacialExpression(d);
              setMascotThoughtBubble(mascot, 'Bach gaya! Yeh naya block sahi hai! 😮‍💨✨', 'normal', 4.2);
              playCartoonSound('cheer_up');
            }

            d.wpIndex++;
            d.wpTimer = 0;

            if (d.wpIndex >= d.waypoints.length) {
              d.state = 'IDLE_ON_BLOCK';
            }
          }

        } else if (d.state === 'WAITING_TO_BE_SLAPPED') {
          bodyPivot.position.y = Math.sin(time * 4) * 0.025;
          headGroup.rotation.y = Math.sin(time * 3) * 0.12;
          leftArmPivot.rotation.set(-2.15, 0, 0.15);
          rightArmPivot.rotation.set(-2.15, 0, -0.15);
          d.posterScaleCurrent = THREE.MathUtils.lerp(d.posterScaleCurrent, 1.0, 0.12);

        } else if (d.state === 'IDLE_ON_BLOCK') {
          const idleFreq = 2.8;
          const breathPhase = Math.sin(time * idleFreq + d.config.id * 1.5);
          bodyPivot.position.y = breathPhase * 0.024;
          bodyPivot.rotation.z = THREE.MathUtils.lerp(bodyPivot.rotation.z, d.hovered ? 0.07 : 0, 0.1);
          bodyPivot.rotation.x = THREE.MathUtils.lerp(bodyPivot.rotation.x, 0, 0.12);

          d.torsoMesh.scale.set(
            1.0 + breathPhase * 0.015,
            1.0 - breathPhase * 0.01,
            1.0 + breathPhase * 0.018
          );

          headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, smoothMouse.x * 0.25, 0.1);
          headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, -smoothMouse.y * 0.14, 0.1);
          headGroup.rotation.z = THREE.MathUtils.lerp(headGroup.rotation.z, 0, 0.1);

          d.eyeHolders.forEach((eh, i) => {
            eh.position.x = THREE.MathUtils.lerp(eh.position.x, (i === 0 ? -0.185 : 0.185) + smoothMouse.x * 0.014, 0.15);
            eh.position.y = THREE.MathUtils.lerp(eh.position.y, -0.025 + smoothMouse.y * 0.010, 0.15);
          });

          leftLegGroup.rotation.x = THREE.MathUtils.lerp(leftLegGroup.rotation.x, 0, 0.15);
          rightLegGroup.rotation.x = THREE.MathUtils.lerp(rightLegGroup.rotation.x, 0, 0.15);
          leftLegGroup.rotation.z = THREE.MathUtils.lerp(leftLegGroup.rotation.z, -0.06, 0.15);
          rightLegGroup.rotation.z = THREE.MathUtils.lerp(rightLegGroup.rotation.z, 0.06, 0.15);

          leftArmPivot.rotation.set(-2.18 + Math.sin(time * 2.2) * 0.035, 0, 0.14);
          rightArmPivot.rotation.set(-2.18 - Math.sin(time * 2.2) * 0.035, 0, -0.14);

          d.facingYaw = THREE.MathUtils.lerp(d.facingYaw, 0, 0.12);
          d.posterScaleCurrent = THREE.MathUtils.lerp(d.posterScaleCurrent, d.hovered ? 1.06 : 1.0, 0.12);
          d.blushMat.opacity = THREE.MathUtils.lerp(d.blushMat.opacity, d.hovered ? 0.45 : 0.24, 0.1);
          shadowMesh.material.opacity = 0.30;
        }

        if (d.state !== 'STAGE4_VICTIM_SPIN' && d.state !== 'STAGE4_SLAP_WINDUP') {
          bodyPivot.rotation.y = d.facingYaw + smoothMouse.x * 0.10;
        }

        signHolderGroup.scale.setScalar(d.posterScaleCurrent);
        signHolderGroup.rotation.z = Math.sin(time * 2.0 + d.config.id) * 0.02;
      });

      document.body.style.cursor = anyPetHovered ? 'pointer' : 'default';

      renderer.render(scene, camera);
      updateDOMThoughtBubbles(delta);
    }

    window.addEventListener('DOMContentLoaded', () => {
      initThreeScene();
      animate();
    });

    function initMascotAudioToggle() {
      const toggle = document.getElementById('audio-toggle');
      if (!toggle) return;
      toggle.addEventListener('click', () => {
        audioEnabled = !audioEnabled;
        toggle.setAttribute('aria-pressed', String(audioEnabled));
        toggle.setAttribute('aria-label', audioEnabled ? 'Turn sound off' : 'Turn sound on');
        toggle.dataset.soundState = audioEnabled ? 'on' : 'off';
        if (audioEnabled) getAudioCtx();
      });
    }

    window.addEventListener('DOMContentLoaded', initMascotAudioToggle);
