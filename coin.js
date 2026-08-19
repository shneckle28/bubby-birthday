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

  // Draws a shape three times (soft dark shadow offset down-right, soft
  // light highlight offset up-left, then the base fill on top) to fake a
  // metal-relief / embossed look so the emblem reads as carved into the
  // coin rather than a flat sticker pasted on top of it.
  function embossShape(ctx, drawPath, base, highlight, shadow, offset = 3) {
    ctx.fillStyle = shadow;
    ctx.save();
    ctx.translate(offset, offset);
    drawPath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = highlight;
    ctx.save();
    ctx.translate(-offset * 0.7, -offset * 0.7);
    drawPath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = base;
    drawPath();
    ctx.fill();
  }

  // Draws text arced along a circle, either along the top of the arc or the
  // bottom, so it reads upright and left-to-right like a coin's engraved
  // legend (e.g. "HAPPY BIRTHDAY BUBBY" up top, "COUPON BOOK" along the
  // bottom).
  function drawArcText(ctx, text, cx, cy, radius, font, color, position = "top") {
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const chars = [...text];
    const widths = chars.map((ch) => ctx.measureText(ch).width);
    const totalAngle = widths.reduce((a, w) => a + w, 0) / radius;

    const dir = position === "top" ? 1 : -1;
    const baseAngle = position === "top" ? -Math.PI / 2 : Math.PI / 2;
    const rotationOffset = position === "top" ? Math.PI / 2 : -Math.PI / 2;
    let angle = baseAngle - (dir * totalAngle) / 2;

    chars.forEach((ch, i) => {
      const chAngle = widths[i] / radius;
      angle += (dir * chAngle) / 2;

      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + rotationOffset);
      ctx.fillText(ch, 0, 0);
      ctx.restore();

      angle += (dir * chAngle) / 2;
    });

    ctx.restore();
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

    // rim legend, arced along the top inner edge
    drawArcText(
      ctx,
      "HAPPY BIRTHDAY BUBBY",
      size / 2,
      size / 2,
      size * 0.4,
      "700 22px Georgia, 'Times New Roman', serif",
      "rgba(110, 68, 24, 0.6)",
      "top"
    );

    // matching legend along the bottom inner edge
    drawArcText(
      ctx,
      "★ COUPON BOOK ★",
      size / 2,
      size / 2,
      size * 0.4,
      "700 22px Georgia, 'Times New Roman', serif",
      "rgba(110, 68, 24, 0.6)",
      "bottom"
    );

    // inner circle -- separates the rim inscriptions from the central
    // emblem, like the divider ring on a real coin.
    ctx.strokeStyle = "rgba(122, 74, 35, 0.4)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.34, 0, Math.PI * 2);
    ctx.stroke();

    // monochrome gold/bronze palette -- everything below reads as one
    // embossed metal relief rather than a colorful illustration.
    const BASE = "#8a5a24";
    const BASE_LIGHT = "#a97a35";
    const HIGHLIGHT = "#f4dd9c";
    const SHADOW = "#5a3812";
    const FROSTING_BASE = "#f0dba0";
    const FROSTING_HI = "#fff3d2";
    const FROSTING_SHADOW = "#c9a24f";

    ctx.save();
    ctx.translate(size / 2, size / 2 + 50);
    // Scaled down so the whole emblem sits comfortably inside the inner
    // divider circle, clear of the rim inscriptions.
    ctx.scale(0.74, 0.74);

    // plate shadow (soft, sits under everything)
    ctx.fillStyle = "rgba(60, 40, 0, 0.28)";
    ctx.beginPath();
    ctx.ellipse(0, 100, 130, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // bottom tier
    embossShape(
      ctx,
      () => roundRect(ctx, -125, 15, 250, 80, 14),
      BASE,
      HIGHLIGHT,
      SHADOW
    );

    // bottom tier frosting band
    embossShape(
      ctx,
      () => roundRect(ctx, -125, -2, 250, 32, 16),
      FROSTING_BASE,
      FROSTING_HI,
      FROSTING_SHADOW,
      2
    );

    // top tier
    embossShape(
      ctx,
      () => roundRect(ctx, -80, -58, 160, 62, 12),
      BASE_LIGHT,
      HIGHLIGHT,
      SHADOW
    );

    // top tier frosting band
    embossShape(
      ctx,
      () => roundRect(ctx, -80, -72, 160, 26, 12),
      FROSTING_BASE,
      FROSTING_HI,
      FROSTING_SHADOW,
      2
    );

    // candles + flames -- kept in the same warm gold family so they read
    // as part of the emblem instead of a colorful sticker.
    for (let i = -1; i <= 1; i += 1) {
      const cx = i * 48;

      embossShape(
        ctx,
        () => {
          ctx.beginPath();
          ctx.rect(cx - 7, -118, 14, 48);
        },
        BASE_LIGHT,
        HIGHLIGHT,
        SHADOW,
        2
      );

      ctx.strokeStyle = "rgba(255, 243, 210, 0.6)";
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
  // Orthographic camera, dead-on with no vertical offset: a perspective
  // camera (especially one positioned above and looking down) makes a
  // spinning flat disc keystone/shear as it turns, which reads as the coin
  // "leaning sideways" instead of tumbling cleanly. Orthographic projection
  // keeps every vertical line on the coin perfectly vertical no matter the
  // spin angle -- only the horizontal width squashes, which is exactly the
  // coin-flip look we want.
  const FRUSTUM = 1.9;
  const camera = new THREE.OrthographicCamera(-FRUSTUM, FRUSTUM, FRUSTUM, -FRUSTUM, 0.1, 100);
  camera.position.set(0, 0, 5.4);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xfff2d6, 0.7));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0xffd76a, 1.3, 20);
  rimLight.position.set(-3, -2, 4);
  scene.add(rimLight);

  const cakeCanvas = drawCakeFace();
  const cakeTexture = new THREE.CanvasTexture(cakeCanvas);
  if ("colorSpace" in cakeTexture) {
    cakeTexture.colorSpace = THREE.SRGBColorSpace;
  }

  // The cylinder's two caps present the same texture 180-degrees rotated
  // relative to each other (verified empirically), so sharing one texture
  // as-is renders the back of the coin upside down and reversed.
  // Pre-rotating a second copy of the artwork by 180 degrees cancels that
  // out, so the back face also reads upright.
  const backCanvas = document.createElement("canvas");
  backCanvas.width = cakeCanvas.width;
  backCanvas.height = cakeCanvas.height;
  const backCtx = backCanvas.getContext("2d");
  backCtx.translate(backCanvas.width, backCanvas.height);
  backCtx.rotate(Math.PI);
  backCtx.drawImage(cakeCanvas, 0, 0);
  const cakeTextureBack = new THREE.CanvasTexture(backCanvas);
  if ("colorSpace" in cakeTextureBack) {
    cakeTextureBack.colorSpace = THREE.SRGBColorSpace;
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
  const faceMatBack = new THREE.MeshStandardMaterial({
    map: cakeTextureBack,
    metalness: 0.3,
    roughness: 0.45,
  });

  const geometry = new THREE.CylinderGeometry(1.6, 1.6, 0.34, 72, 1, false);
  // Bake two 90 degree rotations into the geometry so the cylinder's flat
  // caps face the camera (+/-Z) by default, with the cap's UV "up" (V)
  // lined up with local Y (world up) and UV "right" (U) lined up with
  // local X. Three.js's cylinder cap UVs are actually wired to (z, x), not
  // (x, z) -- a single rotateX only swaps the face to point at the camera
  // but leaves the texture rotated 90 degrees (U along Y, V along X),
  // which is exactly why the cake/text used to come out sideways. The
  // second rotateZ corrects that swap so everything reads upright.
  geometry.rotateX(Math.PI / 2);
  geometry.rotateZ(Math.PI / 2);
  // Material group 1 is the cap that ends up facing +Z (front, upright as
  // drawn); group 2 is the cap facing -Z (back), which needs the
  // pre-flipped texture so it also reads upright once the coin turns.
  const coin = new THREE.Mesh(geometry, [sideMat, faceMat, faceMatBack]);
  // No fixed tilt -- kept perfectly upright at rest. All motion comes from
  // rotation.y below, so the cake/text never lean off-axis.
  scene.add(coin);

  // ---------- SIZING ----------
  function resize() {
    const w = wrap.clientWidth;
    if (!w) return;
    wrap.style.height = `${w}px`;
    renderer.setSize(w, w, false);
    // The wrap is always square, so the orthographic frustum (set once,
    // square) never needs to be recomputed on resize.
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
    faceMatBack.transparent = isTransparent;
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
      faceMatBack.opacity = 1 - ease;

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
      faceMatBack.opacity = ease;

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
