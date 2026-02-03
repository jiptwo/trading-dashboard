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

const chartTypes = {
  "Candles": "./icons/candles.svg",
  "Bars": "./icons/bars.svg",
  "Line": "./icons/line.svg",
  "Heikin Ashi": "./icons/heikin.svg"
};

/* Inject chart menu with icons */
const chartMenu = document.getElementById("chart-menu");
if (chartMenu) {
  chartMenu.innerHTML = "";
  Object.keys(chartTypes).forEach(name => {
    const item = document.createElement("div");
    item.className = "menu-item";
    item.dataset.type = name;

    item.innerHTML = `
      <span>${name}</span>
      <img src="${chartTypes[name]}" class="icon" />
    `;

    chartMenu.appendChild(item);
  });
}

function initFavorites(menuId, favoritesContainerId, iconMode = false) {
  const menu = document.getElementById(menuId);
  const favoritesBar = document.getElementById(favoritesContainerId);
  if (!menu || !favoritesBar) return;

  menu.querySelectorAll(".menu-item").forEach(item => {
    if (item.querySelector(".star")) return;

    const star = document.createElement("span");
    star.className = "star";
    star.textContent = "☆";

    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.justifyContent = "space-between";
    item.appendChild(star);

    star.addEventListener("click", e => {
      e.stopPropagation();

      const label = item.dataset.type || item.textContent.replace("☆", "").replace("★", "").trim();
      const existing = favoritesBar.querySelector(`[data-label="${label}"]`);

      if (existing) {
        existing.remove();
        star.textContent = "☆";
        star.classList.remove("active");
      } else {
        const btn = document.createElement("button");
        btn.className = "btn";
        btn.dataset.label = label;

        if (iconMode && chartTypes[label]) {
          const img = document.createElement("img");
          img.src = chartTypes[label];
          img.className = "icon";
          btn.appendChild(img);
        } else {
          btn.textContent = label;
        }

        favoritesBar.appendChild(btn);
        star.textContent = "★";
        star.classList.add("active");
      }
    });
  });
}

/* Init */
initFavorites("chart-menu", "chart-favorites", true);
initFavorites("timeframe-menu", "timeframe-favorites");

/* ================= CUSTOMIZE COLUMNS ================= */

const watchlistBody = document.querySelector(".watchlist-body");
const tableToggle = document.getElementById("table-toggle");

const columnMap = {
  last: ".price",
  change: ".pos",
  changePct: ".pos",
  volume: ".volume",
  extended: ".extended",
  aiCote: ".ai-cote",
  aiProb: ".ai-prob"
};

/* Table view ON / OFF */
if (tableToggle) {
  tableToggle.addEventListener("change", () => {
    watchlistBody.style.display = tableToggle.checked ? "block" : "none";
  });
}

/* Column visibility */
document.querySelectorAll("#columns-menu input[data-col]").forEach(cb => {
  cb.addEventListener("change", () => {
    const selector = columnMap[cb.dataset.col];
    if (!selector) return;

    document.querySelectorAll(selector).forEach(el => {
      el.style.display = cb.checked ? "" : "none";
    });
  });
});

