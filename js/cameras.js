/* ==========================================================================
   Murray Death — Chrome Noir Archive
   Cameras page renderer: specimen grid + detail modal popup.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  renderCameras();
});

function renderCameras() {
  const grid = document.getElementById("cameras-grid");
  if (!grid) return;

  if (!CAMERAS.length) {
    grid.outerHTML = `<div class="empty-state">No cameras archived yet</div>`;
    return;
  }

  grid.innerHTML = CAMERAS.map((cam, i) => {
    const cover = cam.photos && cam.photos[0];
    return `
    <div class="reveal" style="transition-delay:${Math.min(i * 0.05, 0.5)}s">
      <button class="camera-card focus-ring" data-index="${i}" aria-label="Open details for ${escapeHtml(cam.name)}">
        <div class="card-head">
          <span>${String(i + 1).padStart(2, "0")}</span>
          <span class="text-leak">${escapeHtml(cam.film || "N/A")}</span>
        </div>
        <div class="card-image">
          ${cover
            ? `<img src="${escapeAttr(cover)}" alt="${escapeHtml(cam.name)}" loading="lazy" />`
            : `<div style="display:flex;height:100%;align-items:center;justify-content:center;color:rgba(194,194,194,0.3)">${ICONS.camera}</div>`
          }
          <div class="scanlines" style="position:absolute;inset:0;opacity:0.2;pointer-events:none;"></div>
        </div>
        <div class="card-footer">
          <div>
            <p class="name">${escapeHtml(cam.name)}</p>
            <p class="sub">${escapeHtml(cam.company)}${cam.year ? " · " + escapeHtml(cam.year) : ""}</p>
          </div>
          ${ICONS.arrowUpRight}
        </div>
      </button>
    </div>`;
  }).join("");

  initScrollReveal();

  const modal = document.getElementById("camera-modal");
  const modalCard = modal.querySelector(".modal-card");

  function openModal(cam) {
    modalCard.innerHTML = renderModalContent(cam);
    modal.classList.add("open");

    const photos = cam.photos || [];
    const frameImg = modalCard.querySelector(".modal-photo .frame img");
    modalCard.querySelectorAll(".thumbs button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.index);
        frameImg.src = photos[i];
        modalCard.querySelectorAll(".thumbs button").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
    modalCard.querySelector(".modal-close").addEventListener("click", closeModal);
  }
  function closeModal() {
    modal.classList.remove("open");
  }

  grid.querySelectorAll(".camera-card").forEach((btn) => {
    btn.addEventListener("click", () => openModal(CAMERAS[Number(btn.dataset.index)]));
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

function renderModalContent(cam) {
  const photos = cam.photos || [];
  const cover = photos[0];

  const specs = [
    ["Lens", cam.lens],
    ["Focal", cam.focal],
    ["Shutter", cam.shutter],
    ["Condition", cam.condition],
    ["Acquired", cam.acquired],
    ["Value", cam.value],
  ]
    .filter(([, v]) => v)
    .map(
      ([k, v]) => `<div class="spec"><span class="k">${escapeHtml(k)}</span><span class="v">${escapeHtml(v)}</span></div>`
    )
    .join("");

  const thumbs =
    photos.length > 1
      ? `<div class="thumbs">${photos
          .map(
            (p, i) =>
              `<button data-index="${i}" class="${i === 0 ? "active" : ""}" aria-label="View photo ${i + 1}"><img src="${escapeAttr(p)}" alt="" /></button>`
          )
          .join("")}</div>`
      : "";

  return `
    <button class="modal-close focus-ring" aria-label="Close">${ICONS.x}</button>
    <div class="modal-grid">
      <div class="modal-photo">
        <div class="frame">
          ${cover
            ? `<img src="${escapeAttr(cover)}" alt="${escapeHtml(cam.name)}" />`
            : `<div style="display:flex;height:100%;align-items:center;justify-content:center;color:rgba(194,194,194,0.3)">${ICONS.camera}</div>`
          }
          <div class="scanlines" style="position:absolute;inset:0;opacity:0.2;pointer-events:none;"></div>
        </div>
        ${thumbs}
      </div>
      <div class="modal-info">
        <div>
          <p class="kicker">${escapeHtml(cam.film || "Archive Specimen")}</p>
          <h3>${escapeHtml(cam.name)}</h3>
          <p class="maker">${escapeHtml(cam.company)}${cam.year ? " · " + escapeHtml(cam.year) : ""}${cam.country ? " · " + escapeHtml(cam.country) : ""}</p>
        </div>
        <div class="modal-specs">${specs}</div>
        ${cam.notes ? `<div class="modal-note"><p class="h">// Notes</p><p>${escapeHtml(cam.notes)}</p></div>` : ""}
        ${cam.history ? `<div class="modal-note"><p class="h">// History</p><p>${escapeHtml(cam.history)}</p></div>` : ""}
        ${cam.repairs_notes ? `<div class="modal-note"><p class="h">// Repairs</p><p>${escapeHtml(cam.repairs_notes)}</p></div>` : ""}
      </div>
    </div>`;
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(str) {
  return escapeHtml(str);
}
