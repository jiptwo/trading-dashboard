console.log("MAIN.JS LOADED");

/* ================= DROPDOWNS ================= */

document.addEventListener("click", (e) => {
  document.querySelectorAll(".dropdown-menu.open").forEach(menu => {
    const btn = document.querySelector(`.dropdown-btn[data-dropdown="${menu.id}"]`);
    const keepOpen = e.target.closest('[data-keepopen="true"]');
    if (keepOpen) return;

    if (!menu.contains(e.target) && (!btn || !btn.contains(e.target))) {
      menu.classList.remove("open");
    }
  });

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
            btn.textContent = label;
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

/* ================= WATCHLISTS MODEL ================= */

const WATCHLIST_COLORS = [
  { key: "red", label: "Red", css: "red" },
  { key: "blue", label: "Blue", css: "blue" },
  { key: "green", label: "Green", css: "green" },
  { key: "orange", label: "Orange", css: "orange" },
  { key: "purple", label: "Purple", css: "purple" },
  { key: "yellow", label: "Yellow", css: "yellow" },
  { key: "cyan", label: "Cyan", css: "cyan" },
  { key: "pink", label: "Pink", css: "pink" },
  { key: "lime", label: "Lime", css: "lime" },
  { key: "indigo", label: "Indigo", css: "indigo" },
];

function defaultListName(colorKey) {
  const c = WATCHLIST_COLORS.find(x => x.key === colorKey);
  return `${c ? c.label : "New"} list`;
}

const COMPANY_INFO = {
  AAPL: { name: "Apple Inc.", exchange: "NASDAQ", sector: "Technology", status: "Market open" },
  TSLA: { name: "Tesla, Inc.", exchange: "NASDAQ", sector: "Automotive", status: "Market open" },
  BCAL: { name: "California BanCorp", exchange: "NASDAQ", sector: "Finance", status: "Market open" },
  AMZN: { name: "Amazon.com, Inc.", exchange: "NASDAQ", sector: "Consumer", status: "Market open" },
};

function makeDefaultColumnSettings() {
  return {
    tableView: true,
    cols: {
      last: true,
      change: true,
      changePct: true,
      volume: true,
      extended: false,
      aiCote: false,
      aiProb: false,
    }
  };
}

function makeDefaultSection(items = []) {
  return {
    id: `sec_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    name: "Symbols",
    items
  };
}

const watchlists = [
  {
    id: "wl_red",
    name: "Red list",
    color: "red",
    sections: [
      makeDefaultSection([
        { symbol: "BCAL", last: "0", change: "+0.00", changePct: "+0.00%", volume: "—", extended: "—", aiCote: "—", aiProb: "—", note: "" },
        { symbol: "TSLA", last: "0", change: "+0.00", changePct: "+0.00%", volume: "—", extended: "—", aiCote: "—", aiProb: "—", note: "" },
        { symbol: "AAPL", last: "182.34", change: "+0.76", changePct: "+0.42%", volume: "—", extended: "—", aiCote: "—", aiProb: "—", note: "" },
      ])
    ],
    ui: {
      columns: makeDefaultColumnSettings(),
      sort: { mode: "auto", key: "symbol", dir: "asc" } // auto or manual
    }
  },
];

let activeWatchlistId = "wl_red";

/* ================= UI STATE ================= */

let searchTerm = "";

const chartArea = document.getElementById("chart-area");
const watchlistBody = document.getElementById("watchlist-body");
const searchInput = document.getElementById("watchlist-search");

const tableToggle = document.getElementById("table-toggle");

/* ================= COLUMNS ================= */

const columnsOrder = [
  { key: "symbol", label: "Symbol", always: true, sortable: true },
  { key: "last", label: "Last", sortable: true },
  { key: "change", label: "Change", sortable: true },
  { key: "changePct", label: "Change %", sortable: true },
  { key: "volume", label: "Volume", sortable: true },
  { key: "extended", label: "Extended", sortable: true },
  { key: "aiCote", label: "Ai Cote", sortable: true },
  { key: "aiProb", label: "Ai Prob", sortable: true },
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

function ensureWatchlistIntegrity(wl) {
  if (!wl.ui) wl.ui = { columns: makeDefaultColumnSettings(), sort: { mode: "auto", key: "symbol", dir: "asc" } };
  if (!wl.ui.columns) wl.ui.columns = makeDefaultColumnSettings();
  if (!wl.sections || !wl.sections.length) wl.sections = [makeDefaultSection([])];
}

function getVisibleColumnsFor(wl) {
  ensureWatchlistIntegrity(wl);

  const visible = new Set(["symbol"]);
  if (!wl.ui.columns.tableView) return visible;

  Object.keys(wl.ui.columns.cols).forEach(k => {
    if (wl.ui.columns.cols[k]) visible.add(k);
  });
  return visible;
}

function applyColumnUIFromWatchlist(wl) {
  ensureWatchlistIntegrity(wl);

  // table view checkbox
  if (tableToggle) tableToggle.checked = !!wl.ui.columns.tableView;

  // column checkboxes
  Object.keys(wl.ui.columns.cols).forEach(k => {
    const cb = document.querySelector(`#columns-menu input[data-col="${k}"]`);
    if (cb) cb.checked = !!wl.ui.columns.cols[k];
  });
}

/* ================= SORT + MANUAL ORDER ================= */

function parseNum(val) {
  if (val == null) return Number.NEGATIVE_INFINITY;
  const s = String(val).trim();
  if (s === "—" || s === "") return Number.NEGATIVE_INFINITY;

  if (s.endsWith("%")) {
    const n = parseFloat(s.replace("%",""));
    return isNaN(n) ? Number.NEGATIVE_INFINITY : n;
  }

  let t = s.replace(/,/g, "").replace("+", "");

  const m = t.match(/^(-?\d+(\.\d+)?)([KMB])$/i);
  if (m) {
    const base = parseFloat(m[1]);
    const suf = m[3].toUpperCase();
    const mult = suf === "K" ? 1e3 : suf === "M" ? 1e6 : 1e9;
    return base * mult;
  }

  const n = parseFloat(t);
  return isNaN(n) ? Number.NEGATIVE_INFINITY : n;
}

function compareItems(a, b, key) {
  if (key === "symbol") return String(a.symbol).localeCompare(String(b.symbol));
  return parseNum(a[key]) - parseNum(b[key]);
}

function toggleSort(key) {
  const wl = getActiveWatchlist();
  ensureWatchlistIntegrity(wl);

  wl.ui.sort.mode = "auto";
  if (wl.ui.sort.key === key) {
    wl.ui.sort.dir = (wl.ui.sort.dir === "asc") ? "desc" : "asc";
  } else {
    wl.ui.sort.key = key;
    wl.ui.sort.dir = "asc";
  }

  renderWatchlist();
}

/* ================= COLUMN RESIZE ================= */

let resizingCol = null;
let startX = 0;
let startW = 0;

function attachHeaderResizers(headerEl) {
  if (!headerEl || !watchlistBody) return;
  const cells = Array.from(headerEl.children);
  cells.forEach((cell, idx) => {
    if (idx === cells.length - 1) return; // actions
    if (cell.querySelector(".col-resizer")) return;

    const key = columnsOrder[idx]?.key;
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

/* ================= TOOLTIP ================= */

const tooltip = document.getElementById("symbol-tooltip");

function showTooltip(x, y, html) {
  if (!tooltip) return;
  tooltip.innerHTML = html;
  tooltip.style.left = `${x + 12}px`;
  tooltip.style.top = `${y + 12}px`;
  tooltip.classList.add("open");
}
function hideTooltip() { tooltip?.classList.remove("open"); }

function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

function tooltipHtmlFor(symbol, noteText) {
  const info = COMPANY_INFO[symbol];
  const title = info ? info.name : symbol;

  const line1 = `<div style="font-weight:700;margin-bottom:4px">${title}</div>`;
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

/* ================= QUICK SWITCH DOTS ================= */

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
  ensureWatchlistIntegrity(wl);

  const nameEl = document.getElementById("active-watchlist-name");
  const dotEl = document.getElementById("active-watchlist-dot");

  if (nameEl) nameEl.textContent = wl.name;
  if (dotEl) {
    dotEl.className = "wl-color-dot";
    dotEl.classList.add(wl.color);
  }
}

/* ================= SECTIONS + ROW DRAG ================= */

let dragRowPayload = null;     // { symbol, fromSectionId }
let dragSectionId = null;      // sectionId

function onRowDragStart(e, symbol, fromSectionId) {
  dragRowPayload = { symbol, fromSectionId };
  e.dataTransfer.effectAllowed = "move";
  try { e.dataTransfer.setData("text/plain", symbol); } catch {}
}

function onRowDropToSection(e, toSectionId, insertBeforeSymbol = null) {
  e.preventDefault();
  const wl = getActiveWatchlist();
  ensureWatchlistIntegrity(wl);

  if (!dragRowPayload) return;
  const { symbol, fromSectionId } = dragRowPayload;

  const fromSec = wl.sections.find(s => s.id === fromSectionId);
  const toSec = wl.sections.find(s => s.id === toSectionId);
  if (!fromSec || !toSec) return;

  const idx = fromSec.items.findIndex(it => it.symbol === symbol);
  if (idx < 0) return;

  const [moved] = fromSec.items.splice(idx, 1);

  // insert position
  if (insertBeforeSymbol) {
    const targetIdx = toSec.items.findIndex(it => it.symbol === insertBeforeSymbol);
    if (targetIdx >= 0) toSec.items.splice(targetIdx, 0, moved);
    else toSec.items.push(moved);
  } else {
    toSec.items.push(moved);
  }

  // user manually sorted by drag
  wl.ui.sort.mode = "manual";

  dragRowPayload = null;
  renderWatchlist();
}

function onSectionDragStart(e, sectionId) {
  dragSectionId = sectionId;
  e.dataTransfer.effectAllowed = "move";
}

function onSectionDrop(e, toSectionId) {
  e.preventDefault();
  const wl = getActiveWatchlist();
  ensureWatchlistIntegrity(wl);
  if (!dragSectionId) return;
  if (dragSectionId === toSectionId) return;

  const fromIdx = wl.sections.findIndex(s => s.id === dragSectionId);
  const toIdx = wl.sections.findIndex(s => s.id === toSectionId);
  if (fromIdx < 0 || toIdx < 0) return;

  const [sec] = wl.sections.splice(fromIdx, 1);
  wl.sections.splice(toIdx, 0, sec);

  dragSectionId = null;
  renderWatchlist();
}

/* ================= RENDER WATCHLIST ================= */

function renderWatchlist() {
  if (!watchlistBody) return;

  const wl = getActiveWatchlist();
  ensureWatchlistIntegrity(wl);

  const visible = getVisibleColumnsFor(wl);

  // collect all items for filtering
  const q = (searchTerm || "").trim().toUpperCase();

  // clear
  watchlistBody.innerHTML = "";

  // header
  const header = document.createElement("div");
  header.className = "watchlist-table-header";

  columnsOrder.forEach((col) => {
    const cell = document.createElement("span");
    const isVisible = col.key === "symbol" ? true : visible.has(col.key);

    if (!isVisible) {
      cell.className = `col ${col.key} col-hidden`;
      cell.textContent = col.label;
      header.appendChild(cell);
      return;
    }

    if (col.sortable) cell.classList.add("th-sort");
    cell.dataset.key = col.key;

    const ind = (wl.ui.sort.mode === "auto" && wl.ui.sort.key === col.key) ? (wl.ui.sort.dir === "asc" ? "▲" : "▼") : "";
    cell.innerHTML = `${col.label}${ind ? ` <span class="sort-ind">${ind}</span>` : ""}`;

    if (col.key === "symbol") cell.classList.add("col-symbol");
    else cell.classList.add("col", col.key);

    cell.addEventListener("click", () => {
      if (!col.sortable) return;
      toggleSort(col.key);
    });

    header.appendChild(cell);
  });

  const actionsH = document.createElement("span");
  actionsH.className = "col actions";
  actionsH.textContent = "";
  header.appendChild(actionsH);

  watchlistBody.appendChild(header);
  attachHeaderResizers(header);

  // sections
  wl.sections.forEach(section => {
    // section wrapper
    const secWrap = document.createElement("div");
    secWrap.className = "section";
    secWrap.dataset.sectionId = section.id;

    // section header
    const secHeader = document.createElement("div");
    secHeader.className = "section-header";
    secHeader.draggable = true;

    secHeader.addEventListener("dragstart", (e) => onSectionDragStart(e, section.id));
    secHeader.addEventListener("dragover", (e) => e.preventDefault());
    secHeader.addEventListener("drop", (e) => onSectionDrop(e, section.id));

    secHeader.innerHTML = `
      <span class="section-drag" title="Drag section">⋮⋮</span>
      <span class="section-name" data-edit="true">${escapeHtml(section.name)}</span>
      <div class="section-actions">
        <button class="section-btn" data-action="deleteSection">Delete</button>
      </div>
    `;

    // rename on click
    const nameEl = secHeader.querySelector(".section-name");
    nameEl.addEventListener("click", () => {
      const current = section.name;
      const next = window.prompt("Section name:", current);
      if (next == null) return;
      const t = next.trim();
      if (!t) return;
      section.name = t;
      renderWatchlist();
    });

    // delete section
    secHeader.querySelector('[data-action="deleteSection"]').addEventListener("click", () => {
      if (wl.sections.length <= 1) {
        alert("You cannot delete the last section.");
        return;
      }
      const ok = window.confirm(`Delete section "${section.name}"?\nSymbols in this section will be moved to the first section.`);
      if (!ok) return;

      const idx = wl.sections.findIndex(s => s.id === section.id);
      if (idx < 0) return;

      const removed = wl.sections.splice(idx, 1)[0];
      // move items to first section
      wl.sections[0].items.push(...removed.items);

      renderWatchlist();
    });

    secWrap.appendChild(secHeader);

    // section drop zone (drop row into empty space)
    secWrap.addEventListener("dragover", (e) => e.preventDefault());
    secWrap.addEventListener("drop", (e) => onRowDropToSection(e, section.id, null));

    // items (filter + sort/manual)
    let items = [...section.items];

    if (q) items = items.filter(it => String(it.symbol).toUpperCase().includes(q));

    if (wl.ui.sort.mode === "auto") {
      items.sort((a, b) => {
        const base = compareItems(a, b, wl.ui.sort.key);
        return wl.ui.sort.dir === "asc" ? base : -base;
      });
    }

    items.forEach(item => {
      const row = document.createElement("div");
      row.className = "watchlist-row";
      row.dataset.symbol = item.symbol;
      row.dataset.sectionId = section.id;
      row.draggable = true;

      row.addEventListener("dragstart", (e) => onRowDragStart(e, item.symbol, section.id));
      row.addEventListener("dragover", (e) => e.preventDefault());

      // Drop before this symbol (gives precise ordering)
      row.addEventListener("drop", (e) => onRowDropToSection(e, section.id, item.symbol));

      const noteIcon = item.note ? `<span class="note-icon" title="Personal note">📝</span>` : "";

      const symbolCell = document.createElement("span");
      symbolCell.className = "col-symbol";
      symbolCell.innerHTML = `
        <span class="dot ${wl.color}"></span>
        <span class="symbol js-symbol" data-symbol="${item.symbol}">${item.symbol}${noteIcon}</span>
      `;
      row.appendChild(symbolCell);

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

      // tooltip + click to load chart
      const symEl = row.querySelector(".js-symbol");
      if (symEl) {
        symEl.addEventListener("mousemove", (e) => showTooltip(e.clientX, e.clientY, tooltipHtmlFor(item.symbol, item.note)));
        symEl.addEventListener("mouseleave", hideTooltip);
        symEl.addEventListener("click", () => {
          if (chartArea) chartArea.textContent = `Chart Area — ${item.symbol}`;
        });
      }

      // right click menu
      row.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        openRowMenu(e.clientX, e.clientY, item.symbol);
      });

      actions.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;
        const act = btn.dataset.action;
        if (act === "delete") confirmDelete(item.symbol);
        if (act === "move") alert(`${item.symbol} Move to watchlist (use right click menu for list)`);
      });

      secWrap.appendChild(row);
    });

    watchlistBody.appendChild(secWrap);
  });
}

function renderAllWatchlistUI() {
  const wl = getActiveWatchlist();
  ensureWatchlistIntegrity(wl);

  setActiveHeader();
  renderQuickSwitch();
  applyColumnUIFromWatchlist(wl);
  renderWatchlist();
}

/* ================= CUSTOMIZE COLUMNS (PER WATCHLIST) ================= */

function saveColumnSettingsFromUI() {
  const wl = getActiveWatchlist();
  ensureWatchlistIntegrity(wl);

  wl.ui.columns.tableView = !!(tableToggle && tableToggle.checked);

  Object.keys(wl.ui.columns.cols).forEach(k => {
    const cb = document.querySelector(`#columns-menu input[data-col="${k}"]`);
    if (cb) wl.ui.columns.cols[k] = !!cb.checked;
  });
}

tableToggle?.addEventListener("change", () => {
  saveColumnSettingsFromUI();
  renderWatchlist();
});

document.querySelectorAll("#columns-menu input[data-col]").forEach(cb => {
  cb.addEventListener("change", () => {
    saveColumnSettingsFromUI();
    renderWatchlist();
  });
});

/* ================= SEARCH ================= */

searchInput?.addEventListener("input", () => {
  searchTerm = searchInput.value || "";
  renderWatchlist();
});

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
  ensureWatchlistIntegrity(wl);

  const exists = wl.sections.some(sec => sec.items.some(x => x.symbol === sym));
  if (exists) { closeAddModal(); return; }

  // add to first section
  wl.sections[0].items.push({
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
  renderWatchlist();
});

symbolInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addConfirm.click();
  if (e.key === "Escape") closeAddModal();
});

/* ================= WATCHLIST MENU (RENAME / CREATE / DELETE / ADD SECTION) ================= */

const renameOverlay = document.getElementById("rename-overlay");
const renameInput = document.getElementById("rename-input");
const renameConfirm = document.getElementById("rename-confirm");
const renameCancel = document.getElementById("rename-cancel");

function openRenameModal() {
  const wl = getActiveWatchlist();
  ensureWatchlistIntegrity(wl);

  renameOverlay?.classList.add("open");
  renameInput.value = wl.name || "";
  renameInput.focus();
}
function closeRenameModal() { renameOverlay?.classList.remove("open"); }

renameCancel?.addEventListener("click", closeRenameModal);
renameOverlay?.addEventListener("click", (e) => { if (e.target === renameOverlay) closeRenameModal(); });

renameConfirm?.addEventListener("click", () => {
  const wl = getActiveWatchlist();
  ensureWatchlistIntegrity(wl);

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

function getUsedColorsSet() {
  return new Set(watchlists.map(w => w.color));
}

function openCreateModal() {
  createOverlay?.classList.add("open");
  createNameInput.value = "";

  const used = getUsedColorsSet();
  const firstFree = WATCHLIST_COLORS.find(c => !used.has(c.key));
  selectedCreateColor = firstFree ? firstFree.key : WATCHLIST_COLORS[0].key;

  renderCreateColorPicker();
  updateCreateButtonState();
}
function closeCreateModal() { createOverlay?.classList.remove("open"); }

function updateCreateButtonState() {
  const used = getUsedColorsSet();
  const canCreate = watchlists.length < WATCHLIST_COLORS.length && !used.has(selectedCreateColor);
  if (createConfirm) createConfirm.disabled = !canCreate;
}

function renderCreateColorPicker() {
  if (!createPicker) return;
  createPicker.innerHTML = "";

  const used = getUsedColorsSet();

  WATCHLIST_COLORS.forEach(c => {
    const d = document.createElement("div");
    const isUsed = used.has(c.key);
    const isSelected = c.key === selectedCreateColor;

    d.className = `color-choice ${c.css} ${isSelected ? "selected" : ""} ${isUsed && !isSelected ? "disabled" : ""}`;
    d.title = isUsed ? `${c.label} (already used)` : c.label;

    d.addEventListener("click", () => {
      if (isUsed && !isSelected) return;
      selectedCreateColor = c.key;
      renderCreateColorPicker();
      updateCreateButtonState();
    });

    createPicker.appendChild(d);
  });
}

createCancel?.addEventListener("click", closeCreateModal);
createOverlay?.addEventListener("click", (e) => { if (e.target === createOverlay) closeCreateModal(); });

createConfirm?.addEventListener("click", () => {
  if (watchlists.length >= WATCHLIST_COLORS.length) {
    alert("You already reached the maximum number of watchlists (10).");
    return;
  }

  const used = getUsedColorsSet();
  if (used.has(selectedCreateColor)) {
    alert("This color is already used. Please select another color.");
    return;
  }

  const customName = (createNameInput.value || "").trim();
  const name = customName || defaultListName(selectedCreateColor);

  const id = `wl_${Date.now()}`;

  watchlists.push({
    id,
    name,
    color: selectedCreateColor,
    sections: [makeDefaultSection([])],
    ui: {
      columns: makeDefaultColumnSettings(),
      sort: { mode: "auto", key: "symbol", dir: "asc" }
    }
  });

  activeWatchlistId = id;
  closeCreateModal();
  renderAllWatchlistUI();
});

function deleteActiveWatchlist() {
  if (watchlists.length <= 1) {
    alert("You cannot delete the last watchlist.");
    return;
  }

  const wl = getActiveWatchlist();
  const ok = window.confirm(`Are you sure you want to delete "${wl.name}"?`);
  if (!ok) return;

  const idx = watchlists.findIndex(w => w.id === wl.id);
  if (idx >= 0) watchlists.splice(idx, 1);

  activeWatchlistId = watchlists[0].id;
  renderAllWatchlistUI();
}

function addSectionToActiveWatchlist() {
  const wl = getActiveWatchlist();
  ensureWatchlistIntegrity(wl);

  const name = window.prompt("Section name:", "New section");
  if (name == null) return;

  const t = name.trim();
  if (!t) return;

  wl.sections.push({
    id: `sec_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    name: t,
    items: []
  });

  renderWatchlist();
}

const watchlistMenu = document.getElementById("watchlist-menu");
watchlistMenu?.addEventListener("click", (e) => {
  const item = e.target.closest(".menu-item");
  if (!item) return;

  const action = item.dataset.wlAction;
  if (action === "rename") openRenameModal();
  if (action === "create") openCreateModal();
  if (action === "delete") deleteActiveWatchlist();
  if (action === "addSection") addSectionToActiveWatchlist();
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

  noteBtn.textContent = `${symbol}  Add Note`;
  moveText.textContent = `${symbol}  Move to watchlist`;
  compareBtn.textContent = `${symbol}  Compare`;
  deleteBtn.textContent = `${symbol}  Delete`;

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

  rowMenu.style.left = `${x}px`;
  rowMenu.style.top = `${y}px`;
  rowMenu.classList.add("open");
}

function closeRowMenu() {
  rowMenu?.classList.remove("open");
  menuSymbol = null;
}

function findSymbolInWatchlist(wl, symbol) {
  for (const sec of wl.sections) {
    const idx = sec.items.findIndex(x => x.symbol === symbol);
    if (idx >= 0) return { section: sec, idx };
  }
  return null;
}

function moveSymbolToWatchlist(symbol, targetWlId) {
  const from = getActiveWatchlist();
  const to = watchlists.find(w => w.id === targetWlId);
  if (!to) return;

  ensureWatchlistIntegrity(from);
  ensureWatchlistIntegrity(to);

  const found = findSymbolInWatchlist(from, symbol);
  if (!found) return;

  const [moved] = found.section.items.splice(found.idx, 1);
  to.sections[0].items.push(moved);

  renderAllWatchlistUI();
}

function confirmDelete(symbol) {
  const ok = window.confirm(`Are you sure you want to delete ${symbol}?`);
  if (!ok) return;

  const wl = getActiveWatchlist();
  ensureWatchlistIntegrity(wl);

  const found = findSymbolInWatchlist(wl, symbol);
  if (!found) return;

  found.section.items.splice(found.idx, 1);
  renderWatchlist();
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
});

/* ================= NOTES ================= */

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
  ensureWatchlistIntegrity(wl);

  const found = findSymbolInWatchlist(wl, symbol);
  const item = found ? found.section.items[found.idx] : null;

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
  ensureWatchlistIntegrity(wl);

  const found = findSymbolInWatchlist(wl, noteSymbol);
  if (!found) return;

  found.section.items[found.idx].note = (noteText.value || "").trim();
  closeNoteModal();
  renderWatchlist();
});

/* ================= INIT ================= */

renderAllWatchlistUI();
