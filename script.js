const CONFIG = {
  tokenAddress: "",
  pumpFunUrl: "",
  twitter: "https://x.com/kimchiacconsol",
  telegram: "",
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function getPumpFunUrl() {
  if (CONFIG.pumpFunUrl) return CONFIG.pumpFunUrl;
  if (CONFIG.tokenAddress) return `https://pump.fun/coin/${CONFIG.tokenAddress}`;
  return "https://pump.fun";
}

function initContract() {
  const display = document.getElementById("ca-display");
  const copyBtn = document.getElementById("copy-ca");
  const toast = document.getElementById("copy-toast");
  const address = CONFIG.tokenAddress;

  if (!address) {
    display.textContent = "HYgZeYJnKiNCupzTkXtPiG16tTiiuEmwsUNAYFuJpump";
    copyBtn.disabled = true;
    copyBtn.title = "Contract address coming soon";
    return;
  }

  display.textContent = address;

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(address);
      copyBtn.classList.add("copied");
      copyBtn.textContent = "Copied";
      toast.textContent = "Contract address copied.";
      toast.classList.add("show");

      setTimeout(() => {
        copyBtn.classList.remove("copied");
        copyBtn.textContent = "Copy";
        toast.classList.remove("show");
      }, 2500);
    } catch {
      toast.textContent = "Copy failed — select and copy manually.";
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2500);
    }
  });
}

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });

  links.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initSocialLinks() {
  const pumpUrl = getPumpFunUrl();

  document.querySelectorAll("[data-pumpfun]").forEach((el) => {
    el.href = pumpUrl;
  });

  document.querySelectorAll("[data-telegram]").forEach((el) => {
    if (CONFIG.telegram) el.href = CONFIG.telegram;
  });

  document.querySelectorAll("[data-twitter]").forEach((el) => {
    if (CONFIG.twitter) el.href = CONFIG.twitter;
  });
}

let warpBoost = 1;

function initWarp() {
  const canvas = document.querySelector(".warp");
  if (!canvas || reduceMotion) return;

  const ctx = canvas.getContext("2d");
  const hero = canvas.parentElement;
  // Streaks travel opposite the kid's flight path (he flies up and to the right).
  const dir = { x: -0.9, y: 0.44 };
  const colors = ["210, 235, 255", "124, 196, 255", "47, 107, 255", "123, 92, 255"];
  let w = 0;
  let h = 0;
  let dpr = 1;
  let stars = [];
  let visible = true;
  let frame = 0;

  function respawn(s, anywhere) {
    if (anywhere) {
      s.x = Math.random() * w * 1.2;
      s.y = Math.random() * h * 1.2 - h * 0.2;
    } else if (Math.random() < w / (w + h)) {
      s.x = Math.random() * w * 1.2;
      s.y = -20;
    } else {
      s.x = w + 20;
      s.y = Math.random() * h;
    }
    s.speed = (1.5 + Math.random() * 9) * dpr;
    s.width = (0.5 + Math.random() * 1.6) * dpr;
    s.alpha = 0.25 + Math.random() * 0.65;
    s.color = colors[(Math.random() * colors.length) | 0];
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = hero.clientWidth * dpr;
    h = canvas.height = hero.clientHeight * dpr;
    const count = Math.min(220, Math.round((hero.clientWidth * hero.clientHeight) / 9000));
    stars = Array.from({ length: count }, () => {
      const s = {};
      respawn(s, true);
      return s;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = "round";

    for (const s of stars) {
      const v = s.speed * warpBoost;
      const len = v * 7;
      s.x += dir.x * v;
      s.y += dir.y * v;

      if (s.x < -len || s.y > h + len) respawn(s, false);

      ctx.strokeStyle = `rgba(${s.color}, ${s.alpha})`;
      ctx.lineWidth = s.width;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - dir.x * len, s.y - dir.y * len);
      ctx.stroke();
    }

    warpBoost += (1 - warpBoost) * 0.04;
    frame = visible ? requestAnimationFrame(draw) : 0;
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !frame) frame = requestAnimationFrame(draw);
  }).observe(hero);

  window.addEventListener("resize", resize);
  resize();
  frame = requestAnimationFrame(draw);
}

function initScrollFx() {
  const header = document.querySelector(".site-header");
  const heroImage = document.querySelector(".hero-image");
  let lastY = window.scrollY;
  let ticking = false;

  function update() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.style.setProperty("--progress", max > 0 ? (y / max).toFixed(4) : 0);

    if (!reduceMotion && y < window.innerHeight * 1.2) {
      heroImage.style.translate = `0 ${(y * 0.3).toFixed(1)}px`;
    }

    warpBoost = Math.min(6, warpBoost + Math.abs(y - lastY) * 0.02);
    lastY = y;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  update();
}

function countUp(el) {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  if (reduceMotion) return;

  const start = performance.now();
  const duration = 1400;

  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = `${Math.round(target * eased)}${suffix}`;
    if (t < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        entry.target.querySelectorAll("[data-count]").forEach(countUp);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

function initTilt() {
  const stage = document.querySelector(".about-visual");
  const aura = document.querySelector(".aura");
  if (!stage || !aura || reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;

  stage.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    aura.style.transform = `rotateY(${(px * 16).toFixed(2)}deg) rotateX(${(-py * 16).toFixed(2)}deg)`;
  });

  stage.addEventListener("pointerleave", () => {
    aura.style.transform = "";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initContract();
  initNav();
  initSocialLinks();
  initWarp();
  initScrollFx();
  initReveal();
  initTilt();
});
