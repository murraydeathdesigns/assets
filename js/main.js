/* ==========================================================================
   Murray Death — Chrome Noir Archive
   Shared vanilla-JS behavior (lens flare cursor, scroll reveals, command bar)
   No React, no build step, no backend — everything here runs directly
   in the browser from static files.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initLensFlareCursor();
  initScrollReveal();
  initCommandBar();
  initDevelopingLoader();
});

/* ---- Lens flare cursor follower ---- */
function initLensFlareCursor() {
  const flare = document.querySelector(".lens-flare");
  if (!flare) return;

  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isTouch || reduced) return;

  flare.style.display = "block";

  let tx = window.innerWidth / 2;
  let ty = window.innerHeight / 2;
  let cx = tx;
  let cy = ty;

  window.addEventListener("mousemove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
  });

  function loop() {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    flare.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/* ---- Fade/slide-in reveal for elements marked .reveal ---- */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "-40px" }
  );
  items.forEach((el) => io.observe(el));
}

/* ---- Command bar: active section highlight + live clock ---- */
function initCommandBar() {
  const bar = document.querySelector(".command-bar");
  if (!bar) return;

  const links = Array.from(bar.querySelectorAll(".nav a[data-section]"));
  const idxEl = bar.querySelector(".idx");
  const clockEl = bar.querySelector(".clock");
  const sectionIds = links.map((a) => a.dataset.section);
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function setActive(id) {
    links.forEach((a) => a.classList.toggle("active", a.dataset.section === id));
    if (idxEl) {
      const i = sectionIds.indexOf(id);
      idxEl.textContent = `${String(i + 1).padStart(2, "0")} / 0${sectionIds.length}`;
    }
  }

  if (sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    setActive(sectionIds[0]);
  }

  function updateClock() {
    if (!clockEl) return;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    clockEl.textContent = `${h}:${m} LOCAL`;
  }
  updateClock();
  setInterval(updateClock, 30000);
}

/* ---- "Developing" loading tint on first paint ---- */
function initDevelopingLoader() {
  const loader = document.querySelector(".developing-loader");
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add("hidden");
    setTimeout(() => loader.remove(), 700);
  }, 1400);
}
