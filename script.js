// ---------- CONFIG ----------
const BIRTHDAY_MONTH = 8; // August (1-indexed for readability)
const BIRTHDAY_DAY = 19;

const ICONS = {
  dinner: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/></svg>`,
  beach: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 0 1 16 0Z"/><path d="M12 12v8a2 2 0 0 1-4 0"/></svg>`,
  controller: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="20" height="10" rx="5"/><path d="M7 11v4M5 13h4"/><circle cx="16" cy="11.5" r="1"/><circle cx="18.5" cy="14" r="1"/></svg>`,
  pulse: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  ticket: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4Z"/><path d="M9 6v12" stroke-dasharray="2 2"/></svg>`
};

const COUPONS = [
  {
    id: "free-dinner",
    icon: ICONS.dinner,
    title: "Free Dinner On Me",
    desc: "Redeem for a full meal on me. No complaining about the bill."
  },
  {
    id: "beach-day",
    icon: ICONS.beach,
    title: "Beach Day Immunity",
    desc: "I'm coming to surf or hang at the beach with you. No flaking, no excuses."
  },
  {
    id: "couch-coop",
    icon: ICONS.controller,
    title: "Couch Co-Op Pass",
    desc: "One full session of any game of your choice. I'm locked in, no complaints."
  },
  {
    id: "ufc-buyin",
    icon: ICONS.pulse,
    title: "UFC Fight Night at My House",
    desc: "I host the whole thing at my place — we'll watch it together, food's on me, you just show up."
  },
  {
    id: "favor-dodge",
    icon: ICONS.ticket,
    title: "No Questions Asked Favor",
    desc: "One favor, no questions asked. Whatever it is, I'm doing it — no complaints, no explanation needed."
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

// A coupon resets on the next Aug 19th strictly after the moment it was
// redeemed -- so redeeming right before the birthday unlocks it again
// almost immediately after, while redeeming right after locks it for
// nearly a full year, same as a real birthday coupon book would work.
function getCouponResetDate(redeemedAt) {
  const year = redeemedAt.getFullYear();
  let reset = new Date(year, BIRTHDAY_MONTH - 1, BIRTHDAY_DAY);
  if (reset <= redeemedAt) {
    reset = new Date(year + 1, BIRTHDAY_MONTH - 1, BIRTHDAY_DAY);
  }
  return reset;
}

function isLocked(redeemedAt) {
  if (!redeemedAt) return false;
  return Date.now() < getCouponResetDate(redeemedAt).getTime();
}

function daysRemainingLocked(redeemedAt) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const msRemaining = getCouponResetDate(redeemedAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(msRemaining / msPerDay));
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

    const icon = document.createElement("div");
    icon.className = "coupon-icon";
    icon.innerHTML = coupon.icon;
    card.appendChild(icon);

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

// ---------- SPECIAL CARD ----------
function initSpecialCard() {
  const card = document.getElementById("special-card");
  if (!card) return;

  const back = card.querySelector(".special-card-back");
  const message = card.querySelector(".special-card-message");

  // Size the opened card to exactly fit the message instead of guessing a
  // fixed height (which left a big empty gap under shorter renderings of
  // the text, e.g. on wide viewports where fewer lines wrap).
  function syncOpenHeight() {
    if (!back || !message) return;
    const style = getComputedStyle(back);
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;
    const needed = message.scrollHeight + paddingTop + paddingBottom;
    card.style.setProperty("--open-height", `${needed}px`);
  }

  const toggle = () => {
    const opened = card.classList.toggle("opened");
    card.setAttribute("aria-expanded", opened ? "true" : "false");
    if (opened) syncOpenHeight();
  };

  card.addEventListener("click", toggle);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  });

  window.addEventListener("resize", () => {
    if (card.classList.contains("opened")) syncOpenHeight();
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

const CONFETTI_COLORS = ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93", "#ff924c"];

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
  initSpecialCard();

  // Fires every time he visits the page, as requested.
  fireConfetti(500);

  const moreBtn = document.getElementById("more-confetti-btn");
  if (moreBtn) {
    moreBtn.addEventListener("click", () => fireConfetti(400));
  }
});
