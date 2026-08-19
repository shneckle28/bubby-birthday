import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// ---------- ELEMENTS ----------
const wrap = document.getElementById("coin-wrap");
const canvas = document.getElementById("coin-canvas");
const couponGrid = document.getElementById("coupon-grid");
const reformBtn = document.getElementById("reform-btn");
const coinHint = document.getElementById("coin-hint");

if (wrap && canvas && couponGrid && reformBtn) {
  // ---------- CAKE TEXTURE ----------
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawCakeFace() {
    const size = 512;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");

    // gold background disc (matches the coin rim)
    const grad = ctx.createRadialGradient(
      size / 2, size / 2, size * 0.08,
      size / 2, size / 2, size * 0.52
    );
    grad.addColorStop(0, "#ffe9a8");
    grad.addColorStop(1, "#c9950c");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // thin inner ring detail (coin engraving feel)
    ctx.strokeStyle = "rgba(122, 74, 35, 0.35)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.46, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(size / 2, size / 2 + 50);

    // plate shadow
    ctx.fillStyle = "rgba(60, 40, 0, 0.28)";
    ctx.beginPath();
    ctx.ellipse(0, 100, 130, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // bottom tier
    ctx.fillStyle = "#7a4a23";
    roundRect(ctx, -125, 15, 250, 80, 14);
    ctx.fill();

    // bottom tier frosting drip
    ctx.fillStyle = "#fff8ea";
    roundRect(ctx, -125, -2, 250, 32, 16);
    ctx.fill();

    // top tier
    ctx.fillStyle = "#8a5a2b";
    roundRect(ctx, -80, -58, 160, 62, 12);
    ctx.fill();

    // top tier frosting
    ctx.fillStyle = "#fff8ea";
    roundRect(ctx, -80, -72, 160, 26, 12);
    ctx.fill();

    // sprinkles
    const sprinkleColors = ["#ff5da8", "#5dd6a8", "#5dc6ff", "#ffb703"];
    for (let i = 0; i < 22; i += 1) {
      const sx = -110 + Math.random() * 220;
      const sy = -60 + Math.random() * 30;
      ctx.fillStyle = sprinkleColors[i % sprinkleColors.length];
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(Math.random() * Math.PI);
      ctx.fillRect(-6, -1.5, 12, 3);
      ctx.restore();
    }

    // candles + flames
    const candleColors = ["#ff5da8", "#5dd6a8", "#5dc6ff"];
    for (let i = -1; i <= 1; i += 1) {
      const cx = i * 48;
      ctx.fillStyle = candleColors[i + 1];
      ctx.fillRect(cx - 7, -118, 14, 48);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 7, -104);
      ctx.lineTo(cx + 7, -104);
      ctx.stroke();

      ctx.fillStyle = "#ffb703";
      ctx.beginPath();
      ctx.ellipse(cx, -130, 7, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff3c4";
      ctx.beginPath();
      ctx.ellipse(cx, -128, 3.2, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    return c;
  }

  // ---------- SCENE SETUP ----------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  if ("outputColorSpace" in renderer) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.55, 5.4);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xfff2d6, 0.7));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0xffd76a, 1.3, 20);
  rimLight.position.set(-3, -2, 4);
  scene.add(rimLight);

  const cakeTexture = new THREE.CanvasTexture(drawCakeFace());
  if ("colorSpace" in cakeTexture) {
    cakeTexture.colorSpace = THREE.SRGBColorSpace;
  }

  const sideMat = new THREE.MeshStandardMaterial({
    color: 0xd4a017,
    metalness: 0.85,
    roughness: 0.28,
  });
  const faceMat = new THREE.MeshStandardMaterial({
    map: cakeTexture,
    metalness: 0.3,
    roughness: 0.45,
  });

  const geometry = new THREE.CylinderGeometry(1.6, 1.6, 0.34, 72, 1, false);
  const coin = new THREE.Mesh(geometry, [sideMat, faceMat, faceMat]);
  coin.rotation.x = Math.PI / 2.4;
  scene.add(coin);

  // ---------- SIZING ----------
  function resize() {
    const w = wrap.clientWidth;
    if (!w) return;
    wrap.style.height = `${w}px`;
    renderer.setSize(w, w, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", () => setTimeout(resize, 250));

  // ---------- ANIMATION ----------
  const BASE_SPIN = 0.006;
  const ANIM_DURATION = 650;
  let state = "idle"; // idle | opening | opened | closing
  let animStart = 0;

  function setCoinTransparent(isTransparent) {
    sideMat.transparent = isTransparent;
    faceMat.transparent = isTransparent;
  }

  function tick(t) {
    requestAnimationFrame(tick);

    if (state === "opening") {
      const p = Math.min(1, (t - animStart) / ANIM_DURATION);
      const ease = p * p * p;
      coin.rotation.y += BASE_SPIN + ease * 0.95;
      coin.scale.setScalar(Math.max(1 - ease, 0.0001));
      coin.position.y = ease * 0.7;
      sideMat.opacity = 1 - ease;
      faceMat.opacity = 1 - ease;

      if (p >= 1) {
        state = "opened";
        wrap.classList.add("is-hidden");
        couponGrid.classList.remove("is-hidden");
        reformBtn.classList.remove("is-hidden");
        requestAnimationFrame(() => {
          couponGrid.classList.add("revealed");
          reformBtn.classList.add("revealed");
        });
      }
    } else if (state === "closing") {
      const p = Math.min(1, (t - animStart) / ANIM_DURATION);
      const ease = 1 - (1 - p) * (1 - p) * (1 - p);
      coin.rotation.y += BASE_SPIN + (1 - ease) * 0.95;
      coin.scale.setScalar(Math.max(ease, 0.0001));
      coin.position.y = (1 - ease) * 0.7;
      sideMat.opacity = ease;
      faceMat.opacity = ease;

      if (p >= 1) {
        state = "idle";
        setCoinTransparent(false);
        coin.scale.setScalar(1);
        coin.position.y = 0;
      }
    } else if (state === "idle") {
      coin.rotation.y += BASE_SPIN;
    }

    renderer.render(scene, camera);
  }
  requestAnimationFrame(tick);

  // ---------- INTERACTIONS ----------
  function openCoin() {
    if (state !== "idle") return;
    setCoinTransparent(true);
    state = "opening";
    animStart = performance.now();
    if (coinHint) coinHint.classList.add("is-hidden");
  }

  function closeCoin() {
    if (state !== "opened") return;
    couponGrid.classList.remove("revealed");
    reformBtn.classList.remove("revealed");

    setTimeout(() => {
      couponGrid.classList.add("is-hidden");
      reformBtn.classList.add("is-hidden");
      wrap.classList.remove("is-hidden");
      resize();

      setCoinTransparent(true);
      coin.scale.setScalar(0.0001);
      coin.position.y = 0.7;
      state = "closing";
      animStart = performance.now();
      if (coinHint) coinHint.classList.remove("is-hidden");
    }, 260);
  }

  const raycaster = new THREE.Raycaster();
  canvas.addEventListener("click", (e) => {
    if (state !== "idle") return;
    const rect = canvas.getBoundingClientRect();
    const pointer = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    };
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(coin, false);
    if (hits.length > 0) openCoin();
  });

  reformBtn.addEventListener("click", closeCoin);
}
