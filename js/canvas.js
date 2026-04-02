/* js/canvas.js — Three.js particle field background */
(function() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particle system
  const particleCount = 1200;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  const color1 = new THREE.Color(0xf5a623); // amber
  const color2 = new THREE.Color(0x4fc3f7); // blue
  const color3 = new THREE.Color(0x333340); // dark grey

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

    const rand = Math.random();
    let col;
    if (rand < 0.08) col = color1;
    else if (rand < 0.15) col = color2;
    else col = color3;

    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    sizes[i] = Math.random() * 2.5 + 0.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Connection lines (sparse)
  const lineGeom = new THREE.BufferGeometry();
  const linePositions = [];
  const lineColors = [];
  const threshold = 8;

  for (let i = 0; i < 80; i++) {
    const idx1 = Math.floor(Math.random() * particleCount);
    const idx2 = Math.floor(Math.random() * particleCount);
    const x1 = positions[idx1 * 3], y1 = positions[idx1 * 3 + 1], z1 = positions[idx1 * 3 + 2];
    const x2 = positions[idx2 * 3], y2 = positions[idx2 * 3 + 1], z2 = positions[idx2 * 3 + 2];
    const dist = Math.sqrt((x2-x1)**2 + (y2-y1)**2 + (z2-z1)**2);
    if (dist < threshold) {
      linePositions.push(x1, y1, z1, x2, y2, z2);
      lineColors.push(0.96, 0.65, 0.14, 0, 0, 0); // amber to transparent
      lineColors.push(0.96, 0.65, 0.14, 0, 0, 0);
    }
  }

  if (linePositions.length > 0) {
    lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0xf5a623, opacity: 0.12, transparent: true });
    const lines = new THREE.LineSegments(lineGeom, lineMat);
    scene.add(lines);
  }

  camera.position.z = 20;

  // Mouse parallax
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Scroll speed
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  let animId;
  function animate() {
    animId = requestAnimationFrame(animate);
    const t = Date.now() * 0.0002;

    particles.rotation.y = t * 0.08 + mouseX * 0.04;
    particles.rotation.x = t * 0.04 + mouseY * 0.04;

    // Gentle drift
    const pos = geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] += Math.sin(t + i * 0.3) * 0.002;
    }
    geometry.attributes.position.needsUpdate = true;

    camera.position.y = -scrollY * 0.006;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
