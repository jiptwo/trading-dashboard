console.log("MAIN.JS LOADED");

/* ================= DROPDOWNS ================= */

document.addEventListener("click", (e) => {
  // Close dropdowns except keepopen clicks
  document.querySelectorAll(".dropdown-menu.open").forEach(menu => {
    const btn = document.querySelector(`.dropdown-btn[data-dropdown="${menu.id}"]`);
    const keepOpen = e.target.closest('[data-keepopen="true"]');
    if (keepOpen) return;

    if (!menu.contains(e.target) && (!btn || !btn.contains(e.target))) {
      menu.classList.remove("open");
    }
  });

  // close context menu when clicking outside
  const rowMenu = document.getElementById("row-menu");
  if (rowMenu && !rowMenu.contains(e.target)) closeRowMenu();
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

resizerV?.addEventListener("mousedown", () => resizingV = true);
document.addEventListener("mouseup", () => { resizingV = false; resizingCol = null; document.body.style.userSelect = ""; });
document.addEventListener("mousemove", e => {
  if (!resizingV) return;
  const w = window.innerWidth - e.clientX;
  if (w > 320 && w < 900) rightBar.style.width = w + "px";
});

resizerH?.addEventListener("mousedown", () => resizingH = true);
document.addEventListener("mouseup", () => resizingH = false);
document.addEventListener("mousemove", e => {
  if (!resizingH) return;
  const rect = rightBar.getBoundingClientRect();
  const y = e.clientY - rect.top;

  const min = 140;
  const max = rect.height - 140;

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

// Build chart menu (icon -> label)
const chartMenu = document.getElementById("chart-menu");
if (chartMenu) {
  chartMenu.innerHTML = "";
  Object.keys(chartTypes).forEach(name => {
    const item = document.createElement("div");
    item.className = "menu-item";
    item.dataset.label = name;
    item.dataset.type = name;

    item.innerHTML = `
      <img src="${chartTypes[name]}" class="icon" />
      <span class="menu-label">${name}</span>
    `;
    chartMenu.appendChild(item);
  });
}

function initFavorites(menuId, favoritesContainerId, iconMode = false) {
  const menu = document.getElementById(menuId);
  const favoritesBar = document.getElementById(favoritesContainerId);
  if (!menu || !favoritesBar) return;

  menu.querySelectorAll(".menu-item").forEach(item => {
    if (!item.dataset.label) item.dataset.label = (item.textContent || "").trim();
    const label = item.dataset.label;

    if (!item.querySelector(".star")) {
      const star = document.createElement("span");
      star.className = "star";
      star.textContent = "☆";
      item.appendChild(star);

      star.addEventListener("click", (e) => {
        e.stopPropagation();

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
            btn.textContent = label; // ✅ timeframe = only "5m" (no star)
          }

          favoritesBar.appendChild(btn);
          star.textContent = "★";
          star.classList.add("active");
        }
      });
    }
  });
}

initFavorites("chart-menu", "chart-favorites", true);
initFavorites("timeframe-menu", "timeframe-favorites", false);

/* ================= WATCHLISTS DATA MODEL ================= */

const WATCHLIST_COLORS = [
  { key: "red", label: "Red", css: "red" },
  { key: "blue", label: "Blue", css: "blue" },
  { key: "green", label: "Green", css: "green" },
  { key: "orange", label: "Orange", css: "orange" },
  { key: "purple", label: "Purple", css: "purple" },
  { key: "yellow", label: "Yellow", css: "yellow" },
];

function defaultListName(colorKey) {
  const c = WATCHLIST_COLORS.find(x => x.key === colorKey);
  return `${c ? c.label : "New"} list`;
}

// Example "company info" (you can expand later)
const COMPANY_INFO = {
  AAPL: { name: "Apple Inc.", exchange: "NASDAQ", sector: "Technology", status: "Market open" },
  TSLA: { name: "Tesla, Inc.", exchange: "NASDAQ", sector: "Automotive", status: "Market open" },
  BCAL: { name: "California BanCorp", exchange: "NASDAQ", sector: "Finance", status: "Market open" },
  AMZN: { name: "Amazon.com, Inc.", exchange: "NASDAQ", sector: "Consumer", status: "Market open" },
};

const watchlists = [
  {
    id: "wl_red",
    name: "Red list",
    color: "red",
    items: [
      { symbol: "BCAL", last: "0", change: "+0.00", changePct: "+0.00%", volume: "—", extended: "—", aiCote: "—", aiProb: "—", note: "" },
      { symbol: "AAPL", last: "182.34", change: "+0.76", changePct: "+0.42%", volume: "—", extended: "—", aiCote: "—", aiProb: "—", note: "" },
    ],
  },
];

let activeWatchlistId = "wl_red";

/* ================= WATCHLIST TABLE RENDER ================= */

const watchlistBody = document.getElementById("watchlist-body");
const tableToggle = document.getElementById("table-toggle");

const columnsOrder = [
  { key: "symbol", label: "Symbol", always: true },
  { key: "last", label: "Last" },
  { key: "change", label: "Change" },
  { key: "changePct", label: "Change %" },
  { key: "volume", label: "Volume" },
  { key: "extended", label: "Extended" },
  { key: "aiCote", label: "Ai Cote" },
  { key: "aiProb", label: "Ai Prob" },
];

const colVarMap = {
  symbol: "--c-symbol",
  last: "--c-last",
  change: "--c-change",
  changePct: "--c-changePct",
  volume: "--c-volume",
  extended: "--c-extended",
  aiCote: "--c-aiCote",
  aiProb: "--c-aiProb",
};

function getActiveWatchlist() {
  return watchlists.find(w => w.id === activeWatchlistId) || watchlists[0];
}

function getVisibleColumns() {
  const on = !!(tableToggle && tableToggle.checked);
  const visible = new Set(["symbol"]);
  if (!on) return visible;

  // map from checkbox data-col to key
  const keys = ["last","change","changePct","volume","extended","aiCote","aiProb"];
  keys.forEach(k => {
    const cb = document.querySelector(`#columns-menu input[data-col="${k}"]`);
    if (cb && cb.checked) visible.add(k);
  });
  return visible;
}

/* ===== Column resizers ===== */

let resizingCol = null;
let startX = 0;
let startW = 0;

function attachHeaderResizers(headerEl) {
  if (!headerEl || !watchlistBody) return;

  const cells = Array.from(headerEl.children);
  // last is actions (no handle)
  cells.forEach((cell, idx) => {
    if (idx === cells.length - 1) return;
    if (cell.querySelector(".col-resizer")) return;

    const key = idx === 0 ? "symbol" : columnsOrder[idx].key;
    const cssVar = colVarMap[key];
    if (!cssVar) return;

    const handle = document.createElement("div");
    handle.className = "col-resizer";
    handle.title = "Drag to resize";

    handle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      resizingCol = cssVar;
      startX = e.clientX;

      const current = getComputedStyle(watchlistBody).getPropertyValue(cssVar).trim();
      startW = parseInt(current.replace("px",""), 10) || 80;
      document.body.style.userSelect = "none";
    });

    cell.appendChild(handle);
  });
}

document.addEventListener("mousemove", (e) => {
  if (!resizingCol || !watchlistBody) return;
  const dx = e.clientX - startX;
  const next = Math.max(55, startW + dx);
  watchlistBody.style.setProperty(resizingCol, `${next}px`);
});

document.addEventListener("mouseup", () => {
  resizingCol = null;
  document.body.style.userSelect = "";
});

/* ===== Tooltip (company info + note) ===== */

const tooltip = document.getElementById("symbol-tooltip");

function showTooltip(x, y, html) {
  if (!tooltip) return;
  tooltip.innerHTML = html;
  tooltip.style.left = `${x + 12}px`;
  tooltip.style.top = `${y + 12}px`;
  tooltip.classList.add("open");
}

function hideTooltip() {
  tooltip?.classList.remove("open");
}

function tooltipHtmlFor(symbol, noteText) {
  const info = COMPANY_INFO[symbol];
  const title = info ? info.name : symbol;

  const line1 = info ? `<div style="font-weight:700;margin-bottom:4px">${title}</div>` :
                       `<div style="font-weight:700;margin-bottom:4px">${symbol}</div>`;

  const line2 = info
    ? `<div style="opacity:.85">${info.exchange} · ${info.sector} · <span style="color:#22c55e">${info.status}</span></div>`
    : `<div style="opacity:.85">Info not available (demo)</div>`;

  const note = noteText
    ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08)">
         <div style="opacity:.7;margin-bottom:4px">Personal note</div>
         <div>${escapeHtml(noteText).replace(/\n/g,"<br/>")}</div>
       </div>`
    : "";

  return `${line1}${line2}${note}`;
}

function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

/* ===== Render quick dots ===== */

function renderQuickSwitch() {
  const wrap = document.getElementById("wl-quick-switch");
  if (!wrap) return;
  wrap.innerHTML = "";

  watchlists.forEach(wl => {
    const dot = document.createElement("div");
    dot.className = `wl-quick-dot ${wl.color} ${wl.id === activeWatchlistId ? "active" : ""}`;
    dot.title = wl.name;
    dot.addEventListener("click", () => {
      activeWatchlistId = wl.id;
      renderAllWatchlistUI();
    });
    wrap.appendChild(dot);
  });
}

function setActiveHeader() {
  const wl = getActiveWatchlist();
  const nameEl = document.getElementById("active-watchlist-name");
  const dotEl = document.getElementById("active-watchlist-dot");
  if (nameEl) nameEl.textContent = wl.name;
  if (dotEl) {
    dotEl.className = "wl-color-dot";
    dotEl.classList.add(wl.color);
  }
}

/* ===== Render watchlist table ===== */

function renderWatchlistTable() {
  if (!watchlistBody) return;

  const wl = getActiveWatchlist();
  const visible = getVisibleColumns();

  watchlistBody.innerHTML = "";

  const header = document.createElement("div");
  header.className = "watchlist-table-header";

  columnsOrder.forEach((col, i) => {
    const cell = document.createElement("span");
    cell.textContent = col.label;

    if (col.key === "symbol") cell.className = "col-symbol";
    else {
      cell.className = `col ${col.key}`;
      if (!visible.has(col.key)) cell.classList.add("col-hidden");
    }
    header.appendChild(cell);
  });

  const actionsH = document.createElement("span");
  actionsH.className = "col actions";
  actionsH.textContent = "";
  header.appendChild(actionsH);

  watchlistBody.appendChild(header);
  attachHeaderResizers(header);

  wl.items.forEach(item => {
    const row = document.createElement("div");
    row.className = "watchlist-row";
    row.dataset.symbol = item.symbol;

    const noteIcon = item.note ? `<span class="note-icon" title="Personal note">📝</span>` : "";

    const sym = document.createElement("span");
    sym.className = "col-symbol";
    sym.innerHTML = `
      <span class="dot ${wl.color}"></span>
      <span class="symbol js-symbol" data-symbol="${item.symbol}">${item.symbol}${noteIcon}</span>
    `;
    row.appendChild(sym);

    columnsOrder.slice(1).forEach(col => {
      const cell = document.createElement("span");
      cell.className = `cell ${col.key}`;
      cell.textContent = item[col.key] ?? "—";
      if (!visible.has(col.key)) cell.classList.add("col-hidden");
      row.appendChild(cell);
    });

    const actions = document.createElement("span");
    actions.className = "row-actions";
    actions.innerHTML = `
      <button class="row-btn" data-action="move" title="Move to watchlist">⇄</button>
      <button class="row-btn" data-action="delete" title="Delete">🗑</button>
    `;
    row.appendChild(actions);

    // hover tooltip on symbol area (company info + note)
    row.querySelectorAll(".js-symbol").forEach(el => {
      el.addEventListener("mousemove", (e) => {
        showTooltip(e.clientX, e.clientY, tooltipHtmlFor(item.symbol, item.note));
      });
      el.addEventListener("mouseleave", hideTooltip);
    });

    // right click menu on row
    row.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      openRowMenu(e.clientX, e.clientY, item.symbol);
    });

    // row buttons
    actions.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const act = btn.dataset.action;

      if (act === "delete") confirmDelete(item.symbol);
      if (act === "move") alert(`${item.symbol} Move to watchlist (use right click menu for list)`);
    });

    watchlistBody.appendChild(row);
  });
}

function renderAllWatchlistUI() {
  setActiveHeader();
  renderQuickSwitch();
  renderWatchlistTable();
}

/* ================= CUSTOMIZE COLUMNS EVENTS ================= */

tableToggle?.addEventListener("change", renderWatchlistTable);
document.querySelectorAll("#columns-menu input[data-col]").forEach(cb => cb.addEventListener("change", renderWatchlistTable));

/* ================= ADD SYMBOL MODAL ================= */

const addOverlay = document.getElementById("modal-overlay");
const addBtn = document.getElementById("add-symbol-btn");
const symbolInput = document.getElementById("symbol-input");
const addConfirm = document.getElementById("symbol-add-confirm");
const addCancel = document.getElementById("symbol-add-cancel");

function openAddModal() {
  addOverlay?.classList.add("open");
  symbolInput.value = "";
  symbolInput.focus();
}
function closeAddModal() { addOverlay?.classList.remove("open"); }

addBtn?.addEventListener("click", openAddModal);
addCancel?.addEventListener("click", closeAddModal);
addOverlay?.addEventListener("click", (e) => { if (e.target === addOverlay) closeAddModal(); });

addConfirm?.addEventListener("click", () => {
  const sym = (symbolInput.value || "").trim().toUpperCase();
  if (!sym) return;

  const wl = getActiveWatchlist();
  if (wl.items.some(x => x.symbol === sym)) { closeAddModal(); return; }

  wl.items.push({
    symbol: sym,
    last: "0",
    change: "+0.00",
    changePct: "+0.00%",
    volume: "—",
    extended: "—",
    aiCote: "—",
    aiProb: "—",
    note: ""
  });

  closeAddModal();
  renderWatchlistTable();
});

symbolInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addConfirm.click();
  if (e.key === "Escape") closeAddModal();
});

/* ================= WATCHLIST MENU (RENAME / CREATE) ================= */

const renameOverlay = document.getElementById("rename-overlay");
const renameInput = document.getElementById("rename-input");
const renameConfirm = document.getElementById("rename-confirm");
const renameCancel = document.getElementById("rename-cancel");

function openRenameModal() {
  const wl = getActiveWatchlist();
  renameOverlay?.classList.add("open");
  renameInput.value = wl.name || "";
  renameInput.focus();
}
function closeRenameModal() { renameOverlay?.classList.remove("open"); }

renameCancel?.addEventListener("click", closeRenameModal);
renameOverlay?.addEventListener("click", (e) => { if (e.target === renameOverlay) closeRenameModal(); });

renameConfirm?.addEventListener("click", () => {
  const wl = getActiveWatchlist();
  const name = (renameInput.value || "").trim();
  if (!name) return;
  wl.name = name;
  closeRenameModal();
  renderAllWatchlistUI();
});

renameInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") renameConfirm.click();
  if (e.key === "Escape") closeRenameModal();
});

const createOverlay = document.getElementById("create-overlay");
const createPicker = document.getElementById("create-color-picker");
const createNameInput = document.getElementById("create-name-input");
const createConfirm = document.getElementById("create-confirm");
const createCancel = document.getElementById("create-cancel");

let selectedCreateColor = "blue";

function openCreateModal() {
  createOverlay?.classList.add("open");
  createNameInput.value = "";
  selectedCreateColor = "blue";
  renderCreateColorPicker();
}
function closeCreateModal() { createOverlay?.classList.remove("open"); }

function renderCreateColorPicker() {
  if (!createPicker) return;
  createPicker.innerHTML = "";

  WATCHLIST_COLORS.forEach(c => {
    const d = document.createElement("div");
    d.className = `color-choice ${c.css} ${c.key === selectedCreateColor ? "selected" : ""}`;
    d.title = c.label;
    d.addEventListener("click", () => {
      selectedCreateColor = c.key;
      renderCreateColorPicker();
    });
    createPicker.appendChild(d);
  });
}

createCancel?.addEventListener("click", closeCreateModal);
createOverlay?.addEventListener("click", (e) => { if (e.target === createOverlay) closeCreateModal(); });

createConfirm?.addEventListener("click", () => {
  const customName = (createNameInput.value || "").trim();
  const name = customName || defaultListName(selectedCreateColor);

  const id = `wl_${Date.now()}`;
  watchlists.push({
    id,
    name,
    color: selectedCreateColor,
    items: []
  });

  activeWatchlistId = id;
  closeCreateModal();
  renderAllWatchlistUI();
});

/* Handle watchlist menu clicks */
const watchlistMenu = document.getElementById("watchlist-menu");
watchlistMenu?.addEventListener("click", (e) => {
  const item = e.target.closest(".menu-item");
  if (!item) return;

  const action = item.dataset.wlAction;
  if (action === "rename") openRenameModal();
  if (action === "create") openCreateModal();
});

/* ================= RIGHT CLICK MENU ================= */

const rowMenu = document.getElementById("row-menu");
const rowSubmenu = document.getElementById("row-submenu");
const moveText = document.getElementById("row-menu-move-text");
const compareBtn = document.getElementById("row-menu-compare");
const deleteBtn = document.getElementById("row-menu-delete");
const noteBtn = document.getElementById("row-menu-note");

let menuSymbol = null;

function openRowMenu(x, y, symbol) {
  menuSymbol = symbol;

  // dynamic text
  noteBtn.textContent = `${symbol}  Add Note`;
  moveText.textContent = `${symbol}  Move to watchlist`;
  compareBtn.textContent = `${symbol}  Compare`;
  deleteBtn.textContent = `${symbol}  Delete`;

  // submenu = other watchlists
  rowSubmenu.innerHTML = "";
  const current = getActiveWatchlist();

  watchlists
    .filter(wl => wl.id !== current.id)
    .forEach(wl => {
      const b = document.createElement("button");
      b.className = "submenu-item";
      b.innerHTML = `<span class="dot ${wl.color}"></span><span>${wl.name}</span>`;
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        moveSymbolToWatchlist(symbol, wl.id);
        closeRowMenu();
      });
      rowSubmenu.appendChild(b);
    });

  // place menu
  rowMenu.style.left = `${x}px`;
  rowMenu.style.top = `${y}px`;
  rowMenu.classList.add("open");
}

function closeRowMenu() {
  rowMenu?.classList.remove("open");
  menuSymbol = null;
}

function moveSymbolToWatchlist(symbol, targetWlId) {
  const from = getActiveWatchlist();
  const to = watchlists.find(w => w.id === targetWlId);
  if (!to) return;

  const idx = from.items.findIndex(x => x.symbol === symbol);
  if (idx < 0) return;

  const [moved] = from.items.splice(idx, 1);
  to.items.push(moved);

  // Option: switch active list? (TradingView keeps same, so we keep same)
  renderWatchlistTable();
  renderQuickSwitch();
}

function confirmDelete(symbol) {
  const ok = window.confirm(`Are you sure you want to delete ${symbol}?`);
  if (!ok) return;

  const wl = getActiveWatchlist();
  wl.items = wl.items.filter(x => x.symbol !== symbol);
  renderWatchlistTable();
}

rowMenu?.addEventListener("click", (e) => {
  const item = e.target.closest("[data-action]");
  if (!item) return;

  const act = item.dataset.action;

  if (act === "compare" && menuSymbol) {
    alert(`${menuSymbol} Compare (next step)`);
    closeRowMenu();
  }

  if (act === "delete" && menuSymbol) {
    const sym = menuSymbol;
    closeRowMenu();
    confirmDelete(sym);
  }

  if (act === "note" && menuSymbol) {
    const sym = menuSymbol;
    closeRowMenu();
    openNoteModal(sym);
  }

  // move handled by submenu buttons
});

/* ================= NOTES (ADD NOTE MODAL) ================= */

const noteOverlay = document.getElementById("note-overlay");
const noteTitle = document.getElementById("note-title");
const noteText = document.getElementById("note-text");
const noteConfirm = document.getElementById("note-confirm");
const noteCancel = document.getElementById("note-cancel");

let noteSymbol = null;

function openNoteModal(symbol) {
  noteSymbol = symbol;
  noteTitle.textContent = `${symbol}  Add Note`;

  const wl = getActiveWatchlist();
  const item = wl.items.find(x => x.symbol === symbol);

  noteText.value = item?.note || "";
  noteOverlay.classList.add("open");
  noteText.focus();
}

function closeNoteModal() {
  noteOverlay.classList.remove("open");
  noteSymbol = null;
}

noteCancel?.addEventListener("click", closeNoteModal);
noteOverlay?.addEventListener("click", (e) => { if (e.target === noteOverlay) closeNoteModal(); });

noteConfirm?.addEventListener("click", () => {
  if (!noteSymbol) return;

  const wl = getActiveWatchlist();
  const item = wl.items.find(x => x.symbol === noteSymbol);
  if (!item) return;

  item.note = (noteText.value || "").trim();
  closeNoteModal();
  renderWatchlistTable();
});

/* ================= INIT ================= */

renderAllWatchlistUI();
