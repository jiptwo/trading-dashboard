console.log("MAIN.JS LOADED");

/* ================= DROPDOWNS ================= */

document.addEventListener("click", () => {
  document
    .querySelectorAll(".dropdown-menu.open")
    .forEach(m => m.classList.remove("open"));
});

document.querySelectorAll(".dropdown-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation();

    const id = btn.dataset.dropdown;
    const menu = document.getElementById(id);

    if (!menu) return;

    const isOpen = menu.classList.contains("open");

    document
      .querySelectorAll(".dropdown-menu.open")
      .forEach(m => m.classList.remove("open"));

    if (!isOpen) {
      menu.classList.add("open");
    }
  });
});

/* ================= RESIZERS ================= */

const rightBar = document.getElementById("right-bar");
const resizerV = document.getElementById("resizer-vertical");
const resizerH = document.getElementById("resizer-horizontal");
const zone1 = document.getElementById("zone-1");
const zone2 = document.getElementById("zone-2");

let resizingV = false;
let resizingH = false;

/* Vertical (chart / right) */
resizerV.addEventListener("mousedown", () => resizingV = true);
document.addEventListener("mouseup", () => resizingV = false);
document.addEventListener("mousemove", e => {
  if (!resizingV) return;
  const w = window.innerWidth - e.clientX;
  if (w > 260 && w < 600) rightBar.style.width = w + "px";
});

/* Horizontal (zone 1 / zone 2) */
resizerH.addEventListener("mousedown", () => resizingH = true);
document.addEventListener("mouseup", () => resizingH = false);
document.addEventListener("mousemove", e => {
  if (!resizingH) return;

  const rect = rightBar.getBoundingClientRect();
  const y = e.clientY - rect.top;

  const min = 120;
  const max = rect.height - 120;

  if (y > min && y < max) {
    zone1.style.flex = "none";
    zone1.style.height = y + "px";
  }
});

/* ================= FAVORITES (CHART & TIMEFRAME) ================= */

function initFavorites(menuId, favoritesContainerId) {
  const menu = document.getElementById(menuId);
  const favoritesBar = document.getElementById(favoritesContainerId);

  if (!menu || !favoritesBar) return;

  menu.querySelectorAll(".menu-item").forEach(item => {

    // éviter double init
    if (item.querySelector(".star")) return;

    const star = document.createElement("span");
    star.className = "star";
    star.textContent = "☆";
    star.style.marginLeft = "auto";
    star.style.cursor = "pointer";

    item.style.display = "flex";
    item.style.justifyContent = "space-between";
    item.appendChild(star);

    star.addEventListener("click", e => {
      e.stopPropagation();

      const label = item.textContent.replace("☆", "").replace("★", "").trim();
      const existing = favoritesBar.querySelector(`[data-label="${label}"]`);

      if (existing) {
        existing.remove();
        star.textContent = "☆";
      } else {
        const btn = document.createElement("button");
        btn.className = "btn";
        btn.textContent = label;
        btn.dataset.label = label;
        favoritesBar.appendChild(btn);
        star.textContent = "★";
      }
    });
  });
}

/* Init favorites */
initFavorites("chart-menu", "chart-favorites");
initFavorites("timeframe-menu", "timeframe-favorites");
