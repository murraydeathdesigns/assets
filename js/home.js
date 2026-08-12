/* ==========================================================================
   Murray Death — Chrome Noir Archive
   Home page renderers: hero parallax, texture gallery + lightbox,
   leak vault, chronicle slideshow.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initHeroImage();
  initHeroParallax();
  renderGallery();
  renderVault();
  renderChronicle();
});

/* ---- Pick a random hero photo on each page load.
   HERO_IMAGES currently has one entry, so this is a no-op until more
   photos are added to assets/images/hero/ and listed in data.js. ---- */
function initHeroImage() {
  if (!HERO_IMAGES || !HERO_IMAGES.length) return;
  const choice = HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)];
  const bg = document.getElementById("hero-bg-img");
  const frame = document.getElementById("hero-frame-img");
  if (bg) bg.src = choice;
  if (frame) frame.src = choice;
}

/* ---- Hero parallax on mouse move ---- */
function initHeroParallax() {
  const layer = document.querySelector(".hero-bg");
  if (!layer) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;
  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 24;
    const y = (e.clientY / window.innerHeight - 0.5) * 24;
    layer.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.06)`;
  });
}

/* ---- Section 02 — Texture Gallery ---- */
function renderGallery() {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  grid.innerHTML = GALLERY_SHOTS.map(
    (shot, i) => `
    <div class="reveal" style="transition-delay:${i * 0.08}s">
      <button class="shot-card focus-ring" data-index="${i}" aria-label="Open ${escapeHtml(shot.title)}">
        <img src="${shot.src}" alt="${escapeHtml(shot.title)}" loading="lazy" />
        <div class="shot-overlay">
          <div class="panel">
            <p class="title">${escapeHtml(shot.title)}</p>
            <dl>
              <span>ISO ${escapeHtml(shot.iso)}</span>
              <span>${escapeHtml(shot.shutter)}</span>
              <span>${escapeHtml(shot.lens)}</span>
            </dl>
          </div>
        </div>
      </button>
    </div>`
  ).join("");

  initScrollReveal();

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox.querySelector(".lightbox-bg-img");
  const lightboxFigImg = lightbox.querySelector(".lightbox-fig-img");
  const lightboxName = lightbox.querySelector(".name");
  const lightboxExif = lightbox.querySelector(".exif");

  function openLightbox(shot) {
    lightboxImg.src = shot.src;
    lightboxFigImg.src = shot.src;
    lightboxFigImg.alt = shot.title;
    lightboxName.textContent = shot.title;
    lightboxExif.textContent = `${shot.iso} · ${shot.shutter} · ${shot.lens}`;
    lightbox.classList.add("open");
  }
  function closeLightbox() {
    lightbox.classList.remove("open");
  }

  grid.querySelectorAll(".shot-card").forEach((btn) => {
    btn.addEventListener("click", () => openLightbox(GALLERY_SHOTS[Number(btn.dataset.index)]));
  });
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("lightbox-backdrop") || e.target === lightboxImg) {
      closeLightbox();
    }
  });
  lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

/* ---- Section 03 — Leak Vault ---- */
function renderVault() {
  const scroller = document.getElementById("vault-scroller");
  if (!scroller) return;

  scroller.innerHTML = ALBUMS.map(
    (album, i) => `
    <div class="reveal" style="transition-delay:${Math.min(i * 0.06, 0.6)}s">
      <a class="film-strip focus-ring" href="${escapeAttr(album.href)}" target="_blank" rel="noopener noreferrer" aria-label="Open Lightroom album: ${escapeHtml(album.name)}">
        <div class="strip-head">
          <span>${String(i + 1).padStart(2, "0")}</span>
        </div>
        <div class="strip-image">
          <img src="${escapeAttr(album.cover)}" alt="${escapeHtml(album.name)} preview" loading="lazy" />
          <div class="strip-split">
            <div class="half"><img src="${escapeAttr(album.cover)}" alt="" loading="lazy" /></div>
            <div class="divider"></div>
            <span class="tag raw">Raw</span>
            <span class="tag leak">Leak</span>
          </div>
          <div class="scanlines" style="position:absolute;inset:0;opacity:0.3;pointer-events:none;"></div>
        </div>
        <div class="strip-footer">
          <div>
            <p class="name">${escapeHtml(album.name)}</p>
          </div>
          ${ICONS.arrowUpRight}
        </div>
        <div class="sprockets">${"<span></span>".repeat(7)}</div>
      </a>
    </div>`
  ).join("");

  initScrollReveal();

  const scrollerEl = document.getElementById("vault-scroller");
  document.getElementById("vault-prev")?.addEventListener("click", () => {
    scrollerEl.scrollBy({ left: -300, behavior: "smooth" });
  });
  document.getElementById("vault-next")?.addEventListener("click", () => {
    scrollerEl.scrollBy({ left: 300, behavior: "smooth" });
  });
}

/* ---- Section 04 — Chronicle slideshow ---- */
function renderChronicle() {
  const frame = document.getElementById("chronicle-frame");
  const dots = document.getElementById("chronicle-dots");
  const caption = document.getElementById("chronicle-caption");
  if (!frame) return;

  frame.innerHTML = CHRONICLE_SLIDES.map(
    (src, i) => `<div class="slide${i === 0 ? " active" : ""}" data-index="${i}">
      <img src="${escapeAttr(src)}" alt="Murray Death artwork, frame ${i + 1}" loading="${i === 0 ? "eager" : "lazy"}" />
    </div>`
  ).join("");

  dots.innerHTML = CHRONICLE_SLIDES.map(
    (_, i) => `<button aria-label="Show frame ${i + 1}" data-index="${i}" class="${i === 0 ? "active" : ""}"></button>`
  ).join("");

  let index = 0;
  const slides = frame.querySelectorAll(".slide");
  const dotEls = dots.querySelectorAll("button");

  function show(i) {
    index = i;
    slides.forEach((s, n) => s.classList.toggle("active", n === i));
    dotEls.forEach((d, n) => d.classList.toggle("active", n === i));
    caption.textContent = `Frame ${String(i + 1).padStart(3, "0")} · Artwork`;
  }
  show(0);

  dotEls.forEach((d) => d.addEventListener("click", () => show(Number(d.dataset.index))));

  if (CHRONICLE_SLIDES.length > 1) {
    setInterval(() => show((index + 1) % CHRONICLE_SLIDES.length), 4200);
  }
}

/* ---- helpers ---- */
function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(str) {
  return escapeHtml(str);
}
