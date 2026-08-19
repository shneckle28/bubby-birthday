// ---------- CONFIG ----------
const BIRTHDAY_MONTH = 8; // August (1-indexed for readability)
const BIRTHDAY_DAY = 19;
const LOCK_DAYS = 365;

const COUPONS = [
  {
    id: "free-dinner",
    emoji: "🍽️",
    title: "Free Dinner On Me",
    desc: "Redeem for a full meal on me. No complaining about the bill."
  },
  {
    id: "beach-day",
    emoji: "🏄",
    title: "Beach Day Immunity",
    desc: "I'm coming to surf or hang at the beach with you. No flaking, no excuses."
  },
  {
    id: "couch-coop",
    emoji: "🎮",
    title: "Couch Co-Op Pass",
    desc: "One full session of any game of your choice. I'm locked in, no complaints."
  },
  {
    id: "sports-bar",
    emoji: "📺",
    title: "Sports Bar Summons",
    desc: "I have to watch a full game with you and actually pay attention."
  },
  {
    id: "ufc-buyin",
    emoji: "🥊",
    title: "UFC Fight Night Buy-In",
    desc: "I chip in on the PPV or come watch it with you, no arguments."
  },
  {
    id: "favor-dodge",
    emoji: "🃏",
    title: "Chore / Favor Dodge",
    desc: "One no-questions-asked favor, or a task you'd have made me do — skipped."
  }
];

// ---------- COUNTDOWN ----------
function getNextBirthday() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let target = new Date(now.getFullYear(), BIRTHDAY_MONTH - 1, BIRTHDAY_DAY);

  // If today IS the birthday, or the birthday already passed this year,
  // count down to next year's birthday instead.
  if (target <= today) {
    target = new Date(now.getFullYear() + 1, BIRTHDAY_MONTH - 1, BIRTHDAY_DAY);
  }

  return target;
}

function renderCountdown() {
  const daysEl = document.getElementById("countdown-days");
  const hoursEl = document.getElementById("countdown-hours");
  const minutesEl = document.getElementById("countdown-minutes");
  const secondsEl = document.getElementById("countdown-seconds");
  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const target = getNextBirthday();
  const diff = Math.max(0, target.getTime() - Date.now());

  const msPerSecond = 1000;
  const msPerMinute = msPerSecond * 60;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;

  const days = Math.floor(diff / msPerDay);
  const hours = Math.floor((diff % msPerDay) / msPerHour);
  const minutes = Math.floor((diff % msPerHour) / msPerMinute);
  const seconds = Math.floor((diff % msPerMinute) / msPerSecond);

  daysEl.textContent = days;
  hoursEl.textContent = String(hours).padStart(2, "0");
  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");
}

// ---------- COUPONS ----------
function storageKey(id) {
  return `bubby_coupon_${id}_redeemedAt`;
}

function getRedeemedAt(id) {
  const raw = localStorage.getItem(storageKey(id));
  return raw ? new Date(raw) : null;
}

function isLocked(redeemedAt) {
  if (!redeemedAt) return false;
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSince = (Date.now() - redeemedAt.getTime()) / msPerDay;
  return daysSince < LOCK_DAYS;
}

function daysRemainingLocked(redeemedAt) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSince = (Date.now() - redeemedAt.getTime()) / msPerDay;
  return Math.max(0, Math.ceil(LOCK_DAYS - daysSince));
}

function redeemCoupon(id) {
  localStorage.setItem(storageKey(id), new Date().toISOString());
  renderCoupons();
  fireConfetti(220);
}

function renderCoupons() {
  const grid = document.getElementById("coupon-grid");
  if (!grid) return;
  grid.innerHTML = "";

  COUPONS.forEach((coupon) => {
    const redeemedAt = getRedeemedAt(coupon.id);
    const locked = isLocked(redeemedAt);

    const card = document.createElement("div");
    card.className = "coupon-card" + (locked ? " redeemed" : "");

    const stamp = document.createElement("div");
    stamp.className = "stamp";
    stamp.textContent = "REDEEMED";
    card.appendChild(stamp);

    const emoji = document.createElement("div");
    emoji.className = "coupon-emoji";
    emoji.textContent = coupon.emoji;
    card.appendChild(emoji);

    const title = document.createElement("h3");
    title.className = "coupon-title";
    title.textContent = coupon.title;
    card.appendChild(title);

    const desc = document.createElement("p");
    desc.className = "coupon-desc";
    desc.textContent = coupon.desc;
    card.appendChild(desc);

    const status = document.createElement("p");
    status.className = "coupon-status";
    if (locked) {
      status.textContent = `Resets in ${daysRemainingLocked(redeemedAt)} day(s)`;
    }
    card.appendChild(status);

    const btn = document.createElement("button");
    btn.className = "coupon-btn";
    btn.textContent = locked ? "Redeemed" : "Redeem";
    btn.disabled = locked;
    btn.addEventListener("click", () => {
      if (!locked) redeemCoupon(coupon.id);
    });
    card.appendChild(btn);

    grid.appendChild(card);
  });
}

// ---------- CONFETTI ----------
const canvas = document.getElementById("confetti-canvas");
const ctx = canvas.getContext("2d");
let particles = [];
let confettiRunning = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const CONFETTI_COLORS = ["#ffb703", "#fb8500", "#ff5d8f", "#4ade80", "#4cc9f0", "#f4f6ff"];

function fireConfetti(count = 160) {
  const newParticles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.3,
    size: 6 + Math.random() * 6,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    speedY: 2 + Math.random() * 3,
    speedX: -2 + Math.random() * 4,
    rotation: Math.random() * 360,
    rotationSpeed: -6 + Math.random() * 12,
    shape: Math.random() > 0.5 ? "rect" : "circle",
    life: 0,
    maxLife: 260 + Math.random() * 120
  }));
  particles = particles.concat(newParticles);

  if (!confettiRunning) {
    confettiRunning = true;
    requestAnimationFrame(animateConfetti);
  }
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p) => {
    p.x += p.speedX;
    p.y += p.speedY;
    p.rotation += p.rotationSpeed;
    p.life += 1;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);

    if (p.shape === "rect") {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  particles = particles.filter(
    (p) => p.life < p.maxLife && p.y < canvas.height + 40
  );

  if (particles.length > 0) {
    requestAnimationFrame(animateConfetti);
  } else {
    confettiRunning = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  renderCountdown();
  setInterval(renderCountdown, 1000);
  renderCoupons();

  // Fires every time he visits the page, as requested.
  fireConfetti(220);

  const moreBtn = document.getElementById("more-confetti-btn");
  if (moreBtn) {
    moreBtn.addEventListener("click", () => fireConfetti(180));
  }
});
