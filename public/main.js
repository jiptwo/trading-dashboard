console.log("MAIN.JS LOADED");

/* ================= DROPDOWNS ================= */

document.addEventListener("click", (e) => {
  document.querySelectorAll(".dropdown-menu.open").forEach(menu => {
    const btn = document.querySelector(`.dropdown-btn[data-dropdown="${menu.id}"]`);
    if (!menu.contains(e.target) && (!btn || !btn.contains(e.target))) {
      menu.classList.remove("open");
    }
  });
});

document.querySelectorAll(".dropdown-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation();

    const id = btn.dataset.dropdown;
    const menu = document.getElementById(id);
    if (!menu) return;

    const isOpen = menu.classList.contains("open");
    document.querySelectorAll(".dropdown-menu.open").forEach(m => m.classList.remove("open"));
    if (!isOpen) menu.classList.add("open");
  });
});

/* ================= RESIZERS ================= */

const rightBar = document.getElementById("right-bar");
const resizerV = document.getElementById("resizer-vertical");
const resizerH = document.getElementById("resizer-horizontal");
const zone1 = document.getElementById("zone-1");

let resizingV = false;
let resizingH = false;

const RIGHT_MIN = 260;
const RIGHT_MAX = 600;

resizerV.addEventListener("mousedown", () => resizingV = true);
document.addEventListener("mouseup", () => resizingV = false);
document.addEventListener("mousemove", e => {
  if (!resizingV) return;
  const w = window.innerWidth - e.clientX;
  if (w >= RIGHT_MIN && w <= RIGHT_MAX) {
    rightBar.style.width = w + "px";
  }
});

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

/* ================= FAVORITES ================= */

const chartTypes = {
  "Candles": "./icons/candles.svg",
  "Bars": "./icons/bars.svg",
  "Line": "./icons/line.svg",
  "Heikin Ashi": "./icons/heikin.svg"
};

const chartMenu = document.getElementById("chart-menu");
if (chartMenu) {
  chartMenu.innerHTML = "";
  Object.keys(chartTypes).forEach(name => {
    const item = document.createElement("div");
    item.className = "menu-item";
    item.dataset.type = name;

    item.innerHTML = `
      <img src="${chartTypes[name]}" class="icon" />
      <span class="menu-label">${name}</span>
    `;
    chartMenu.appendChild(item);
  });
}

function cleanLabel(text){
  return text.replace("★","").replace("☆","").trim();
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
    item.appendChild(star);

    star.addEventListener("click", e => {
      e.stopPropagation();

      const label = item.dataset.type ? item.dataset.type : cleanLabel(item.textContent);
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
          btn.textContent = label; // ✅ timeframe = juste “5m” (pas d’étoile)
        }

        favoritesBar.appendChild(btn);
        star.textContent = "★";
        star.classList.add("active");
      }
    });
  });
}

initFavorites("chart-menu", "chart-favorites", true);
initFavorites("timeframe-menu", "timeframe-favorites");

/* ================= CUSTOMIZE COLUMNS (✅ TABLE PRO) ================= */

const tableToggle = document.getElementById("table-toggle");
const watchlistBody = document.querySelector(".watchlist-body");

/* mapping : checkbox -> class de cellule */
const columnConfig = [
  { key: "last",      label: "Last",      cls: ".price",      width: "minmax(70px, 1fr)" },
  { key: "change",    label: "Change",    cls: ".change",     width: "minmax(70px, 1fr)" },
  { key: "changePct", label: "Change %",  cls: ".change-pct", width: "minmax(80px, 1fr)" },
  { key: "volume",    label: "Volume",    cls: ".volume",     width: "minmax(80px, 1fr)" },
  { key: "extended",  label: "Extended",  cls: ".extended",   width: "minmax(100px, 1fr)" },
  { key: "aiCote",    label: "Ai Cote",   cls: ".ai-cote",    width: "minmax(80px, 1fr)" },
  { key: "aiProb",    label: "Ai Prob",   cls: ".ai-prob",    width: "minmax(80px, 1fr)" },
];

/* Header de table */
function ensureHeader(){
  if (!watchlistBody) return null;
  let header = watchlistBody.querySelector(".watchlist-table-header");
  if (!header) {
    header = document.createElement("div");
    header.className = "watchlist-table-header";
    watchlistBody.prepend(header);
  }
  return header;
}

/* calcule colonnes visibles + grille */
function getVisibleColumns(){
  const visible = [];

  if (!tableToggle || !tableToggle.checked) return visible;

  columnConfig.forEach(col => {
    const cb = document.querySelector(`#columns-menu input[data-col="${col.key}"]`);
    if (cb && cb.checked) visible.push(col);
  });

  return visible;
}

function updateWatchlistGrid(){
  const header = ensureHeader();
  if (!header) return;

  const visibleCols = getVisibleColumns();

  /* ✅ Grille = dot + symbol toujours, puis seulement colonnes visibles */
  const parts = [
    "14px",                    // dot
    "minmax(90px, 1.4fr)"      // symbol
  ];

  visibleCols.forEach(c => parts.push(c.width));
  document.documentElement.style.setProperty("--wl-cols", parts.join(" "));

  /* Header contenu */
  header.innerHTML = "";
  const hSymbol = document.createElement("span");
  hSymbol.textContent = "Symbol";
  header.appendChild(hSymbol);

  visibleCols.forEach(c => {
    const h = document.createElement("span");
    h.textContent = c.label;
    header.appendChild(h);
  });

  /* Lignes : on cache/affiche les cellules (et comme la grille est recalculée -> plus de vide) */
  document.querySelectorAll(".watchlist-row").forEach(row => {
    columnConfig.forEach(c => {
      const cell = row.querySelector(c.cls);
      if (!cell) return;

      const isVisible = visibleCols.some(v => v.key === c.key);
      cell.classList.toggle("col-hidden", !isVisible);
    });
  });
}

/* events */
if (tableToggle) tableToggle.addEventListener("change", updateWatchlistGrid);

document.querySelectorAll("#columns-menu input[data-col]")
  .forEach(cb => cb.addEventListener("change", updateWatchlistGrid));

/* init */
updateWatchlistGrid();
