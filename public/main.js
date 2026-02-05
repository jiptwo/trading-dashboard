console.log("MAIN.JS LOADED");

/* ================= DROPDOWNS =================
   IMPORTANT: on garde open/close normal,
   mais on NE ferme pas un menu si on clique sur un élément "data-keepopen".
*/

document.addEventListener("click", (e) => {
  document.querySelectorAll(".dropdown-menu.open").forEach(menu => {
    const btn = document.querySelector(`.dropdown-btn[data-dropdown="${menu.id}"]`);
    const keepOpen = e.target.closest('[data-keepopen="1"]');
    if (keepOpen && menu.contains(keepOpen)) return;

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

/* ================= WATCHLIST DATA (mock) =================
   Plus tard: on branchera Supabase / API.
*/

const WATCHLISTS = [
  { id: "red", name: "Red list", colorClass: "red" },
  { id: "blue", name: "Blue list", colorClass: "red" },   // placeholder
  { id: "green", name: "Green list", colorClass: "red" }, // placeholder
];

let activeWatchlistId = "red";

const watchlistStore = {
  red: [
    { symbol: "AAPL", last: 182.34, change: +0.76, changePct: +0.42, volume: "—", extended: "—", aiCote: "—", aiProb: "—" }
  ],
  blue: [
    { symbol: "AMZN", last: 238.62, change: -4.34, changePct: -1.79, volume: "53.83M", extended: "—", aiCote: "—", aiProb: "—" }
  ],
  green: []
};

// mock info tooltip
const companyInfo = {
  AAPL: { name: "Apple Inc.", exchange: "NASDAQ", session: "Real-time", status: "Market open" },
  AMZN: { name: "Amazon.com, Inc.", exchange: "NASDAQ", session: "Real-time", status: "Market open" },
  BTCUSD: { name: "Bitcoin / USD", exchange: "CRYPTO", session: "Real-time", status: "24/7" },
};

const watchlistBody = document.getElementById("watchlist-body");
const activeWatchlistName = document.getElementById("active-watchlist-name");

/* ================= CUSTOMIZE COLUMNS ================= */

const tableToggle = document.getElementById("table-toggle");

const columns = [
  { key: "last",      label: "Last",      cls: "price",      min: 60,  def: 70 },
  { key: "change",    label: "Change",    cls: "chg",        min: 60,  def: 70 },
  { key: "changePct", label: "Change %",  cls: "change-pct", min: 66,  def: 78 },
  { key: "volume",    label: "Volume",    cls: "volume",     min: 66,  def: 78 },
  { key: "extended",  label: "Extended",  cls: "extended",   min: 78,  def: 90 },
  { key: "aiCote",    label: "Ai Cote",   cls: "ai-cote",    min: 60,  def: 70 },
  { key: "aiProb",    label: "Ai Prob",   cls: "ai-prob",    min: 60,  def: 70 },
];

// widths (persist in memory)
const wlWidth = {
  dot:    { w: 12, min: 10 },
  symbol: { w: 96, min: 78 },
  last: 70,
  change: 70,
  changePct: 78,
  volume: 78,
  extended: 90,
  aiCote: 70,
  aiProb: 70
};

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

/* ================= COLUMN RESIZERS ================= */

let activeResize = null;

document.addEventListener("mousemove", (e) => {
  if (!activeResize) return;

  const dx = e.clientX - activeResize.startX;
  const key = activeResize.key;

  if (key === "symbol") {
    const next = Math.max(wlWidth.symbol.min, activeResize.startW + dx);
    wlWidth.symbol.w = Math.min(next, 180);
  } else {
    const col = columns.find(c => c.key === key);
    const min = col?.min ?? 60;
    const next = Math.max(min, activeResize.startW + dx);
    wlWidth[key] = Math.min(next, 220);
  }

  setGridTemplate(getVisibleColumns());
});

document.addEventListener("mouseup", () => {
  if (!activeResize) return;
  activeResize = null;
  document.body.classList.remove("resizing-cols");
});

function attachResizers(header, visible){
  header.querySelectorAll(".col-resizer").forEach(r => r.remove());

  const cells = Array.from(header.querySelectorAll("span"));
  const lastIndex = cells.length - 1;

  cells.forEach((cell, idx) => {
    if (idx === 0) return;
    if (idx === lastIndex) return;

    const resizer = document.createElement("div");
    resizer.className = "col-resizer";
    resizer.title = "Resize column";

    resizer.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();

      let key;
      if (idx === 1) key = "symbol";
      else key = visible[idx - 2]?.key;

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

/* ================= WATCHLIST RENDER ================= */

function formatSigned(n){
  if (typeof n !== "number") return n ?? "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}`;
}
function formatPct(n){
  if (typeof n !== "number") return n ?? "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function ensureHeader(){
  let header = watchlistBody.querySelector(".watchlist-table-header");
  if (!header) {
    header = document.createElement("div");
    header.className = "watchlist-table-header";
    watchlistBody.appendChild(header);
  }
  return header;
}

function renderHeader(){
  const header = ensureHeader();
  const visible = getVisibleColumns();
  setGridTemplate(visible);

  header.innerHTML = "";
  const hDot = document.createElement("span"); hDot.textContent = ""; header.appendChild(hDot);
  const hSymbol = document.createElement("span"); hSymbol.textContent = "Symbol"; header.appendChild(hSymbol);

  visible.forEach(c => {
    const h = document.createElement("span");
    h.textContent = c.label;
    header.appendChild(h);
  });

  attachResizers(header, visible);
}

function makeRow(item){
  const visible = getVisibleColumns();
  const row = document.createElement("div");
  row.className = "watchlist-row";
  row.dataset.symbol = item.symbol;

  // dot
  const dot = document.createElement("span");
  dot.className = "dot red";
  row.appendChild(dot);

  // symbol (hover tooltip)
  const sym = document.createElement("span");
  sym.className = "symbol";
  sym.textContent = item.symbol;
  sym.dataset.tooltip = "1";
  row.appendChild(sym);

  // visible columns
  visible.forEach(c => {
    const cell = document.createElement("span");
    cell.className = c.cls;

    if (c.key === "last") cell.textContent = (item.last ?? "—");
    if (c.key === "change") cell.textContent = formatSigned(item.change);
    if (c.key === "changePct") cell.textContent = formatPct(item.changePct);
    if (c.key === "volume") cell.textContent = item.volume ?? "—";
    if (c.key === "extended") cell.textContent = item.extended ?? "—";
    if (c.key === "aiCote") cell.textContent = item.aiCote ?? "—";
    if (c.key === "aiProb") cell.textContent = item.aiProb ?? "—";

    row.appendChild(cell);
  });

  // actions column (always last visually by CSS grid gaps, but we embed inside last visible cell area)
  // => Instead: we overlay actions by absolute "move-menu"; for row actions we add to the LAST visible cell
  // But since header/row share same grid, we keep actions on hover inside the last cell using a small container.
  // We'll append actions into the LAST column cell if any, else into symbol.
  const actions = document.createElement("div");
  actions.className = "row-actions";

  const moveBtn = document.createElement("button");
  moveBtn.className = "mini-btn";
  moveBtn.title = "Move to watchlist";
  moveBtn.textContent = "⇄";

  const delBtn = document.createElement("button");
  delBtn.className = "mini-btn";
  delBtn.title = "Delete";
  delBtn.textContent = "🗑";

  actions.appendChild(moveBtn);
  actions.appendChild(delBtn);

  // insert actions inside last cell (or symbol if none)
  const lastCell = row.querySelector(`.${(visible[visible.length-1]?.cls)}`) || sym;
  lastCell.style.position = "relative";
  lastCell.appendChild(actions);

  // delete
  delBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const arr = watchlistStore[activeWatchlistId] || [];
    watchlistStore[activeWatchlistId] = arr.filter(x => x.symbol !== item.symbol);
    renderWatchlist();
  });

  // move menu
  moveBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openMoveMenu(moveBtn, item.symbol);
  });

  return row;
}

function renderWatchlist(){
  if (!watchlistBody) return;

  // Title
  const wl = WATCHLISTS.find(w => w.id === activeWatchlistId);
  if (activeWatchlistName && wl) activeWatchlistName.textContent = wl.name;

  watchlistBody.innerHTML = "";
  renderHeader();

  const rows = watchlistStore[activeWatchlistId] || [];
  rows.forEach(item => watchlistBody.appendChild(makeRow(item)));
}

/* ================= MOVE MENU ================= */

let moveMenuEl = null;

function closeMoveMenu(){
  if (moveMenuEl) {
    moveMenuEl.remove();
    moveMenuEl = null;
  }
}

function openMoveMenu(anchorBtn, symbol){
  closeMoveMenu();

  moveMenuEl = document.createElement("div");
  moveMenuEl.className = "move-menu open";

  WATCHLISTS
    .filter(w => w.id !== activeWatchlistId)
    .forEach(w => {
      const it = document.createElement("div");
      it.className = "move-item";
      it.textContent = `Move to: ${w.name}`;
      it.addEventListener("click", () => {
        // remove from current
        const cur = watchlistStore[activeWatchlistId] || [];
        const moving = cur.find(x => x.symbol === symbol);
        watchlistStore[activeWatchlistId] = cur.filter(x => x.symbol !== symbol);

        // add to target (avoid dup)
        const tgt = watchlistStore[w.id] || [];
        if (moving && !tgt.some(x => x.symbol === symbol)) tgt.unshift(moving);
        watchlistStore[w.id] = tgt;

        closeMoveMenu();
        renderWatchlist();
      });
      moveMenuEl.appendChild(it);
    });

  document.body.appendChild(moveMenuEl);

  const rect = anchorBtn.getBoundingClientRect();
  moveMenuEl.style.left = (rect.left - 160) + "px";
  moveMenuEl.style.top  = (rect.bottom + 6) + "px";
}

document.addEventListener("click", () => closeMoveMenu());

/* ================= ADD SYMBOL (+) ================= */

const addBtn = document.getElementById("add-symbol-btn");
const overlay = document.getElementById("modal-overlay");
const input = document.getElementById("symbol-input");
const confirmBtn = document.getElementById("symbol-add-confirm");
const cancelBtn = document.getElementById("symbol-add-cancel");

function openModal(){
  if (!overlay) return;
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden","false");
  setTimeout(() => input && input.focus(), 0);
}

function closeModal(){
  if (!overlay) return;
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden","true");
  if (input) input.value = "";
}

function addSymbolFromInput(){
  const raw = (input?.value || "").trim().toUpperCase();
  if (!raw) return;

  const arr = watchlistStore[activeWatchlistId] || [];
  if (arr.some(x => x.symbol === raw)) {
    closeModal();
    return;
  }

  arr.unshift({
    symbol: raw,
    last: 0,
    change: 0,
    changePct: 0,
    volume: "—",
    extended: "—",
    aiCote: "—",
    aiProb: "—"
  });

  watchlistStore[activeWatchlistId] = arr;
  closeModal();
  renderWatchlist();
}

addBtn?.addEventListener("click", (e) => { e.stopPropagation(); openModal(); });
confirmBtn?.addEventListener("click", addSymbolFromInput);
cancelBtn?.addEventListener("click", closeModal);

overlay?.addEventListener("click", (e) => {
  if (e.target === overlay) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (!overlay?.classList.contains("open")) return;
  if (e.key === "Escape") closeModal();
  if (e.key === "Enter") addSymbolFromInput();
});

/* ================= TOOLTIP (SYMBOL INFO) ================= */

const tooltip = document.getElementById("symbol-tooltip");

function showTooltip(x, y, symbol){
  if (!tooltip) return;
  const info = companyInfo[symbol] || { name: symbol, exchange: "—", session: "—", status: "—" };

  tooltip.innerHTML = `
    <div class="tooltip-title">${info.name}</div>
    <div class="tooltip-muted">${info.exchange} • ${info.session} • ${info.status}</div>
  `;

  tooltip.classList.add("open");
  tooltip.setAttribute("aria-hidden","false");

  const pad = 12;
  tooltip.style.left = (x + pad) + "px";
  tooltip.style.top  = (y + pad) + "px";
}

function hideTooltip(){
  if (!tooltip) return;
  tooltip.classList.remove("open");
  tooltip.setAttribute("aria-hidden","true");
}

document.addEventListener("mousemove", (e) => {
  const el = e.target.closest('[data-tooltip="1"]');
  if (!el) return;
  const sym = el.textContent.trim();
  showTooltip(e.clientX, e.clientY, sym);
});

document.addEventListener("mouseout", (e) => {
  if (e.target.closest('[data-tooltip="1"]')) hideTooltip();
});

/* ================= CUSTOMIZE COLUMNS EVENTS ================= */

function updateWatchlistTable(){
  renderWatchlist();
}

if (tableToggle) tableToggle.addEventListener("change", updateWatchlistTable);
document.querySelectorAll("#columns-menu input[data-col]")
  .forEach(cb => cb.addEventListener("change", updateWatchlistTable));

/* ================= INIT ================= */

renderWatchlist();
