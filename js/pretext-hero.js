/**
 * pretext-hero.js
 * Kinetic typography hero using @chenglou/pretext loaded via ESM
 * Features:
 *  - "FAIZAN BUKHARI" flowing around an animated magnetic orb
 *  - Per-character staggered reveal with velocity
 *  - Role subtitle reflows live as orb moves
 *  - Particle trail following orb
 *  - Shrink-wrap skill pills measured with walkLineRanges
 */

(async function () {
  // ── Load Pretext via ESM from jsDelivr ──────────────────────────────────────
  let prepareWithSegments, layoutNextLine, walkLineRanges, layoutWithLines;
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/@chenglou/pretext@latest/+esm');
    prepareWithSegments = mod.prepareWithSegments;
    layoutNextLine = mod.layoutNextLine;
    walkLineRanges = mod.walkLineRanges;
    layoutWithLines = mod.layoutWithLines;
  } catch (e) {
    console.warn('Pretext failed to load, falling back to static hero:', e);
    return; // graceful fallback — existing CSS hero is still visible
  }

  // ── Canvas setup ─────────────────────────────────────────────────────────────
  const heroSection = document.getElementById('hero');
  if (!heroSection) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'pretext-canvas';
  canvas.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    opacity: 0;
    transition: opacity 1.2s ease;
  `;
  heroSection.style.position = 'relative';
  heroSection.prepend(canvas);

  // Hide the CSS hero name now that canvas takes over
  const heroName = heroSection.querySelector('.hero-name');
  if (heroName) {
    heroName.style.transition = 'opacity 0.8s ease';
    heroName.style.opacity = '0';
    heroName.style.pointerEvents = 'none';
  }

  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    const w = heroSection.offsetWidth;
    const h = heroSection.offsetHeight;
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(DPR, DPR);
    W = w; H = h;
  }

  let W = 0, H = 0;
  resize();
  window.addEventListener('resize', () => { ctx.resetTransform(); resize(); });

  // ── Magnetic orb state ────────────────────────────────────────────────────────
  const orb = {
    x: W * 0.72,
    y: H * 0.42,
    tx: W * 0.72, // target
    ty: H * 0.42,
    r: 90,        // radius — text flows around this
    vx: 0, vy: 0,
    phase: 0,
  };

  // Mouse influence
  let mouseX = W * 0.5, mouseY = H * 0.5;
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  // ── Pretext preparation ───────────────────────────────────────────────────────
  const NAME_FONT   = `800 ${Math.min(W * 0.13, 100)}px "Bebas Neue", sans-serif`;
  const ROLE_FONT   = `400 16px "JetBrains Mono", monospace`;
  const SUB_FONT    = `300 14px "Outfit", sans-serif`;
  const LINE_H_NAME = Math.min(W * 0.135, 108);
  const LINE_H_ROLE = 22;

  const nameText = 'FAIZAN BUKHARI';
  const roleText = 'SDET · Test & Verification · Software Engineer · AI Systems · Technical Product Owner';
  const subText  = '5+ years · Mercedes-Benz · Berlin, Germany · Open to Relocation';

  let namePrepared = prepareWithSegments(nameText, NAME_FONT);
  let rolePrepared = prepareWithSegments(roleText, ROLE_FONT);
  let subPrepared  = prepareWithSegments(subText,  SUB_FONT);

  // ── Per-character reveal animation ───────────────────────────────────────────
  // We'll split the name into chars and animate each individually
  const chars = nameText.split('');
  const charState = chars.map((ch, i) => ({
    ch,
    opacity: 0,
    y_offset: 40,
    delay: i * 0.06,
    born: false,
  }));
  let startTime = null;

  // ── Particle trail ────────────────────────────────────────────────────────────
  const particles = [];
  function spawnParticle() {
    const angle = Math.random() * Math.PI * 2;
    const r = orb.r * (0.8 + Math.random() * 0.4);
    particles.push({
      x: orb.x + Math.cos(angle) * r,
      y: orb.y + Math.sin(angle) * r,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      life: 1,
      size: 1.5 + Math.random() * 2,
      hue: Math.random() > 0.7 ? 'rgba(79,195,247,' : 'rgba(245,166,35,',
    });
  }

  // ── Rendered lines from Pretext obstacle-aware layout ─────────────────────────
  // We use layoutNextLine with narrower widths where orb overlaps
  function computeNameLines() {
    const startX = 60;
    const startY = H * 0.22;
    const defaultW = W - startX - 40;
    const lines = [];
    let cursor = { segmentIndex: 0, graphemeIndex: 0 };
    let y = startY;

    while (true) {
      // Check if this row overlaps the orb
      const orbTop    = orb.y - orb.r - 10;
      const orbBottom = orb.y + orb.r + 10;
      const orbLeft   = orb.x - orb.r - 20;

      let maxW = defaultW;
      let xOff = startX;

      if (y + LINE_H_NAME > orbTop && y < orbBottom) {
        // Row intersects orb — shorten or shift
        if (orbLeft > startX + 80) {
          // Orb is to the right — just shorten the line
          maxW = orbLeft - startX;
        } else {
          // Orb is to the left — shift text right
          xOff = orb.x + orb.r + 24;
          maxW = W - xOff - 20;
        }
      }

      const line = layoutNextLine(namePrepared, cursor, Math.max(maxW, 60));
      if (!line) break;

      lines.push({ text: line.text, x: xOff, y });
      cursor = line.end;
      y += LINE_H_NAME;

      if (y > H * 0.82) break; // safety
    }
    return lines;
  }

  function computeRoleLines() {
    const startX = 60;
    const startY = H * 0.22 + LINE_H_NAME * 2 + 12;
    const maxW = W - 120;
    const lines = [];
    let cursor = { segmentIndex: 0, graphemeIndex: 0 };
    let y = startY;

    while (true) {
      const line = layoutNextLine(rolePrepared, cursor, maxW);
      if (!line) break;
      lines.push({ text: line.text, x: startX, y });
      cursor = line.end;
      y += LINE_H_ROLE;
      if (y > H * 0.88) break;
    }
    return lines;
  }

  // ── Main render loop ──────────────────────────────────────────────────────────
  let frameId;
  function render(ts) {
    frameId = requestAnimationFrame(render);

    if (!startTime) startTime = ts;
    const elapsed = (ts - startTime) / 1000; // seconds

    ctx.clearRect(0, 0, W, H);

    // Stop rendering if scrolled past hero
    if (window.scrollY > H * 0.5) return;

    // ── Orb physics ────────────────────────────────────────────────────────────
    orb.phase += 0.008;

    // Gentle lemniscate drift
    const driftX = Math.sin(orb.phase) * W * 0.18;
    const driftY = Math.sin(orb.phase * 2) * H * 0.08;
    orb.tx = W * 0.68 + driftX;
    orb.ty = H * 0.38 + driftY;

    // Mouse attraction (soft)
    const mDist = Math.hypot(mouseX - orb.x, mouseY - orb.y);
    if (mDist < 250) {
      orb.tx += (mouseX - orb.tx) * 0.15;
      orb.ty += (mouseY - orb.ty) * 0.15;
    }

    // Spring physics
    orb.vx += (orb.tx - orb.x) * 0.04;
    orb.vy += (orb.ty - orb.y) * 0.04;
    orb.vx *= 0.88;
    orb.vy *= 0.88;
    orb.x += orb.vx;
    orb.y += orb.vy;

    // Spawn particles
    if (Math.random() < 0.4) spawnParticle();

    // ── Draw particles ─────────────────────────────────────────────────────────
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.022;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.hue + (p.life * 0.6) + ')';
      ctx.fill();
    }

    // ── Draw orb ───────────────────────────────────────────────────────────────
    const pulse = 1 + Math.sin(ts * 0.003) * 0.04;
    const gr = ctx.createRadialGradient(
      orb.x - orb.r * 0.3, orb.y - orb.r * 0.3, orb.r * 0.05,
      orb.x, orb.y, orb.r * 1.4 * pulse
    );
    gr.addColorStop(0,   'rgba(245,166,35,0.55)');
    gr.addColorStop(0.4, 'rgba(245,166,35,0.15)');
    gr.addColorStop(0.7, 'rgba(79,195,247,0.08)');
    gr.addColorStop(1,   'rgba(79,195,247,0)');

    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.r * 1.4 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = gr;
    ctx.fill();

    // Orb rim
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(245,166,35,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Orb inner dot
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245,166,35,0.8)';
    ctx.fill();

    // ── Obstacle-aware name layout ─────────────────────────────────────────────
    const nameLines = computeNameLines();
    ctx.font = NAME_FONT;

    nameLines.forEach((line, li) => {
      // Per-character rendering with staggered reveal
      let cx = line.x;
      for (let ci = 0; ci < line.text.length; ci++) {
        const ch = line.text[ci];
        const globalCharIdx = nameText.indexOf(ch, nameLines.slice(0, li).join('').length);
        const cs = charState[Math.min(globalCharIdx, charState.length - 1)];

        // Animate opacity
        const charDelay = li * 0.3 + ci * 0.04;
        const t = Math.max(0, Math.min(1, (elapsed - charDelay) / 0.5));
        const opacity = t;
        const yOffset = (1 - t) * 30;

        // Measure char width
        const cw = ctx.measureText(ch).width;

        // Glow on accent chars
        const isAccent = ch !== ' ';
        if (isAccent && opacity > 0.5) {
          ctx.shadowColor = 'rgba(245,166,35,0.4)';
          ctx.shadowBlur = 12 * opacity;
        }

        ctx.globalAlpha = opacity;
        ctx.fillStyle = li === 0 ? '#f0f0f0' : 'rgba(245,166,35,0.85)';
        ctx.fillText(ch, cx, line.y + yOffset);

        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        cx += cw;
      }
    });

    ctx.globalAlpha = 1;

    // ── Role subtitle lines ────────────────────────────────────────────────────
    if (elapsed > 0.8) {
      const roleLines = computeRoleLines();
      const roleAlpha = Math.min(1, (elapsed - 0.8) / 0.6);
      ctx.font = ROLE_FONT;
      ctx.globalAlpha = roleAlpha * 0.55;
      ctx.fillStyle = '#9090a8';

      roleLines.forEach((line, i) => {
        ctx.fillText(line.text, line.x, line.y);
      });
      ctx.globalAlpha = 1;
    }

    // ── Sub line ───────────────────────────────────────────────────────────────
    if (elapsed > 1.2) {
      const subY = H * 0.82;
      const subAlpha = Math.min(1, (elapsed - 1.2) / 0.5);
      ctx.font = SUB_FONT;
      ctx.globalAlpha = subAlpha * 0.45;
      ctx.fillStyle = '#55556a';

      let subCursor = { segmentIndex: 0, graphemeIndex: 0 };
      const subLine = layoutNextLine(subPrepared, subCursor, W - 120);
      if (subLine) ctx.fillText(subLine.text, 60, subY);

      ctx.globalAlpha = 1;
    }

    // ── Orb label ─────────────────────────────────────────────────────────────
    if (elapsed > 1.5) {
      const labelAlpha = Math.min(1, (elapsed - 1.5) / 0.4);
      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.globalAlpha = labelAlpha * 0.7;
      ctx.fillStyle = '#f5a623';
      ctx.fillText('ENGINEER', orb.x - 28, orb.y + 4);
      ctx.globalAlpha = 1;
    }
  }

  // ── Skill pills via walkLineRanges shrink-wrap ─────────────────────────────
  function measureAndStylePills() {
    const pills = document.querySelectorAll('.tag, .skill-tag, .tl-tag, .stag');
    const pillFont = '400 12px "JetBrains Mono", monospace';

    pills.forEach(pill => {
      const text = pill.textContent.trim();
      if (!text) return;
      try {
        const prepared = prepareWithSegments(text, pillFont);
        let measured = 0;
        walkLineRanges(prepared, 9999, line => { measured = line.width; });
        // Add padding to Pretext's measured width — exact, no CSS guessing
        const exactWidth = Math.ceil(measured) + 24; // 12px padding each side
        pill.style.width = exactWidth + 'px';
        pill.style.textAlign = 'center';
        pill.style.whiteSpace = 'nowrap';
      } catch (_) {}
    });
  }

  // ── Kick off ─────────────────────────────────────────────────────────────────
  setTimeout(() => {
    canvas.style.opacity = '1';
    render(performance.now());
    measureAndStylePills();
  }, 400);

  // Stop animating when scrolled away, resume when back
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (!frameId) { startTime = null; render(performance.now()); }
      } else {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    });
  }, { threshold: 0.1 });
  observer.observe(heroSection);

  // Recompute on resize
  window.addEventListener('resize', () => {
    namePrepared = prepareWithSegments(nameText, `800 ${Math.min(W * 0.13, 100)}px "Bebas Neue", sans-serif`);
    rolePrepared = prepareWithSegments(roleText, ROLE_FONT);
    subPrepared  = prepareWithSegments(subText,  SUB_FONT);
    orb.x = W * 0.72;
    orb.y = H * 0.42;
  });

})();
