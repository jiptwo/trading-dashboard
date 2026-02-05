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

/* ================= RESIZERS (PANELS) ================= */

const rightBar = document.getElementById("right-bar");
const resizerV = document.getElementById("resizer-vertical");
const resizerH = document.getElementById("resizer-horizontal");
const zone1 = document.getElementById("zone-1");

let resizingV = false;
let resizingH = false;

resizerV.addEventListener("mousedown", () => resizingV = true);
document.addEventListener("mouseup", () => resizingV = false);
document.addEventListener("mousemove", e => {
  if (!resizingV) return;
  const w = window.innerWidth - e.clientX;
  if (w >= 260 && w <= 600) rightBar.style.width = w + "px";
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
          btn.textContent = label; // timeframe => juste “5m”
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

/* ================= WATCHLIST TABLE (COLUMNS + DRAG RESIZE) ================= */

const tableToggle = document.getElementById("table-toggle");
const watchlistBody = document.querySelector(".watchlist-body");

/* Colonnes custom */
const columns = [
  { key: "last",      label: "Last",      cls: ".price",      min: 60,  def: 70 },
  { key: "change",    label: "Change",    cls: ".chg",        min: 60,  def: 70 },
  { key: "changePct", label: "Change %",  cls: ".change-pct", min: 66,  def: 78 },
  { key: "volume",    label: "Volume",    cls: ".volume",     min: 66,  def: 78 },
  { key: "extended",  label: "Extended",  cls: ".extended",   min: 78,  def: 90 },
  { key: "aiCote",    label: "Ai Cote",   cls: ".ai-cote",    min: 60,  def: 70 },
  { key: "aiProb",    label: "Ai Prob",   cls: ".ai-prob",    min: 60,  def: 70 },
];

/* ✅ Largeurs persistantes (tu peux resize et ça reste) */
const wlWidth = {
  dot:    { w: 12, min: 10 },
  symbol: { w: 96, min: 78 },  // ✅ plus petit qu’avant
  last: 70,
  change: 70,
  changePct: 78,
  volume: 78,
  extended: 90,
  aiCote: 70,
  aiProb: 70
};

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

function getVisibleColumns(){
  if (!tableToggle || !tableToggle.checked) return [];

  const visible = [];
  columns.forEach(col => {
    const cb = document.querySelector(`#columns-menu input[data-col="${col.key}"]`);
    if (cb && cb.checked) visible.push(col);
  });
  return visible;
}

function setGridTemplate(visible){
  const parts = [
    `${wlWidth.dot.w}px`,
    `${wlWidth.symbol.w}px`,
    ...visible.map(c => `${wlWidth[c.key] ?? c.def}px`)
  ];
  document.documentElement.style.setProperty("--wl-cols", parts.join(" "));
}

function applyCellVisibility(visible){
  const visibleKeys = new Set(visible.map(v => v.key));

  document.querySelectorAll(".watchlist-row").forEach(row => {
    columns.forEach(c => {
      const cell = row.querySelector(c.cls);
      if (!cell) return;
      cell.classList.toggle("col-hidden", !visibleKeys.has(c.key));
    });
  });
}

let activeResize = null;

function attachResizers(header, visible){
  // cleanup anciens
  header.querySelectorAll(".col-resizer").forEach(r => r.remove());

  const headerCells = Array.from(header.querySelectorAll("span"));

  // indices:
  // 0 = dot (vide)
  // 1 = Symbol
  // 2.. = colonnes visibles
  // On met un resizer après Symbol + après chaque colonne visible (sauf la dernière)
  const lastIndex = headerCells.length - 1;

  headerCells.forEach((cell, idx) => {
    if (idx === 0) return;            // pas de resize sur le dot
    if (idx === lastIndex) return;    // pas sur la dernière colonne

    const resizer = document.createElement("div");
    resizer.className = "col-resizer";
    resizer.title = "Resize column";

    resizer.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Quelle colonne on resize ?
      let key;
      if (idx === 1) key = "symbol";
      else key = visible[idx - 2]?.key; // idx 2 => visible[0]

      if (!key) return;

      activeResize = {
        key,
        startX: e.clientX,
        startW: key === "symbol" ? wlWidth.symbol.w : (wlWidth[key] ?? 70)
      };

      document.body.classList.add("resizing-cols");
    });

    cell.appendChild(resizer);
  });
}

document.addEventListener("mousemove", (e) => {
  if (!activeResize) return;

  const dx = e.clientX - activeResize.startX;
  const key = activeResize.key;

  if (key === "symbol") {
    const next = Math.max(wlWidth.symbol.min, activeResize.startW + dx);
    wlWidth.symbol.w = Math.min(next, 180); // limite max raisonnable
  } else {
    const col = columns.find(c => c.key === key);
    const min = col?.min ?? 60;
    const next = Math.max(min, activeResize.startW + dx);
    wlWidth[key] = Math.min(next, 220);
  }

  // re-render table grid template
  const visible = getVisibleColumns();
  setGridTemplate(visible);
});

document.addEventListener("mouseup", () => {
  if (!activeResize) return;
  activeResize = null;
  document.body.classList.remove("resizing-cols");
});

function updateWatchlistTable(){
  const header = ensureHeader();
  if (!header) return;

  const visible = getVisibleColumns();
  setGridTemplate(visible);

  // Header render
  header.innerHTML = "";

  const hDot = document.createElement("span");
  hDot.textContent = "";
  header.appendChild(hDot);

  const hSymbol = document.createElement("span");
  hSymbol.textContent = "Symbol";
  header.appendChild(hSymbol);

  visible.forEach(c => {
    const h = document.createElement("span");
    h.textContent = c.label;
    header.appendChild(h);
  });

  // Visibilité des cells
  applyCellVisibility(visible);

  // Resizers
  attachResizers(header, visible);
}

/* Events */
if (tableToggle) tableToggle.addEventListener("change", updateWatchlistTable);
document.querySelectorAll("#columns-menu input[data-col]")
  .forEach(cb => cb.addEventListener("change", updateWatchlistTable));

/* Init */
updateWatchlistTable();
