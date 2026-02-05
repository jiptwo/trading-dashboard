console.log("MAIN.JS LOADED");

/* ================= DROPDOWNS ================= */

document.addEventListener("click", (e) => {
  // close dropdowns (except when clicking keepopen items)
  document.querySelectorAll(".dropdown-menu.open").forEach(menu => {
    const btn = document.querySelector(`.dropdown-btn[data-dropdown="${menu.id}"]`);
    const keepOpen = e.target.closest('[data-keepopen="true"]');
    if (keepOpen) return;

    if (!menu.contains(e.target) && (!btn || !btn.contains(e.target))) {
      menu.classList.remove("open");
    }
  });

  // close row menu when clicking outside
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

/* ================= RESIZERS (PANEL) ================= */

const rightBar = document.getElementById("right-bar");
const resizerV = document.getElementById("resizer-vertical");
const resizerH = document.getElementById("resizer-horizontal");
const zone1 = document.getElementById("zone-1");

let resizingV = false;
let resizingH = false;

resizerV?.addEventListener("mousedown", () => resizingV = true);
document.addEventListener("mouseup", () => { resizingV = false; resizingCol = null; });
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

// build chart menu (icon -> label)
const chartMenu = document.getElementById("chart-menu");
if (chartMenu) {
  chartMenu.innerHTML = "";
  Object.keys(chartTypes).forEach(name => {
    const item = document.createElement("div");
    item.className = "menu-item";
    item.dataset.label = name;          // ✅ stable label
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
    // ✅ stable label for timeframe too (before star is appended)
    if (!item.dataset.label) {
      item.dataset.label = (item.dataset.type || item.textContent || "").trim();
    }
    const label = item.dataset.label;

    // add star only once
    if (!item.querySelector(".star")) {
      const star = document.createElement("span");
      star.className = "star";
      star.textContent = "☆";
      item.appendChild(star);

      star.addEventListener("click", (e) => {
        e.stopPropagation();

        // ✅ toggle correctly by stable label
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
            // ✅ ONLY text (no star)
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

/* ================= WATCHLIST TABLE ================= */

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

const checkboxKey = {
  last: "last",
  change: "change",
  changePct: "changePct",
  volume: "volume",
  extended: "extended",
  aiCote: "aiCote",
  aiProb: "aiProb",
};

let watchlistData = [
  { symbol: "BCAL", color: "red", last: "0", change: "+0.00", changePct: "+0.00%", volume: "—", extended: "—", aiCote: "—", aiProb: "—" },
  { symbol: "TSLA", color: "red", last: "0", change: "+0.00", changePct: "+0.00%", volume: "—", extended: "—", aiCote: "—", aiProb: "—" },
  { symbol: "AAPL", color: "red", last: "182.34", change: "+0.76", changePct: "+0.42%", volume: "—", extended: "—", aiCote: "—", aiProb: "—" },
];

function getVisibleColumns() {
  const on = !!(tableToggle && tableToggle.checked);
  const visible = new Set(["symbol"]);
  if (!on) return visible;

  Object.keys(checkboxKey).forEach(k => {
    const cb = document.querySelector(`#columns-menu input[data-col="${checkboxKey[k]}"]`);
    if (cb && cb.checked) visible.add(k);
  });
  return visible;
}

/* ---- Column resizers (like TradingView) ---- */

const colVarMap = {
  symbol: "--c-symbol",
  last: "--c-last",
  change: "--c-change",
  changePct: "--c-changePct",
  volume: "--c-volume",
  extended: "--c-extended",
  aiCote: "--c-aiCote",
  aiProb: "--c-aiProb"
};

let resizingCol = null;
let startX = 0;
let startW = 0;

function attachHeaderResizers(headerEl) {
  if (!headerEl || !watchlistBody) return;

  const headerCells = Array.from(headerEl.children);
  // last cell is actions col (no resizer)
  headerCells.forEach((cell, idx) => {
    // skip last cell (actions)
    if (idx === headerCells.length - 1) return;

    // avoid duplicates
    if (cell.querySelector(".col-resizer")) return;

    const key = idx === 0 ? "symbol" : columnsOrder[idx].key; // idx aligns to columnsOrder
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
  const next = Math.max(55, startW + dx); // min width
  watchlistBody.style.setProperty(resizingCol, `${next}px`);
});

document.addEventListener("mouseup", () => {
  if (resizingCol) document.body.style.userSelect = "";
  resizingCol = null;
});

/* ---- Render ---- */

function renderWatchlist() {
  if (!watchlistBody) return;
  const visible = getVisibleColumns();
  watchlistBody.innerHTML = "";

  // header
  const header = document.createElement("div");
  header.className = "watchlist-table-header";

  columnsOrder.forEach((col, i) => {
    const cell = document.createElement("span");
    cell.textContent = col.label;

    if (col.key === "symbol") {
      cell.className = "col-symbol";
    } else {
      cell.className = `col ${col.key}`;
      if (!visible.has(col.key)) cell.classList.add("col-hidden");
    }
    header.appendChild(cell);
  });

  // actions header cell
  const actionsH = document.createElement("span");
  actionsH.className = "col actions";
  actionsH.textContent = "";
  header.appendChild(actionsH);

  watchlistBody.appendChild(header);
  attachHeaderResizers(header);

  // rows
  watchlistData.forEach(row => {
    const r = document.createElement("div");
    r.className = "watchlist-row";
    r.dataset.symbol = row.symbol;

    // symbol cell
    const sym = document.createElement("span");
    sym.className = "col-symbol";
    sym.innerHTML = `
      <span class="dot ${row.color || "red"}"></span>
      <span class="symbol">${row.symbol}</span>
    `;
    r.appendChild(sym);

    // other cells
    columnsOrder.slice(1).forEach(col => {
      const cell = document.createElement("span");
      cell.className = `cell ${col.key}`;
      cell.textContent = row[col.key] ?? "—";
      if (!visible.has(col.key)) cell.classList.add("col-hidden");
      r.appendChild(cell);
    });

    // actions column
    const actions = document.createElement("span");
    actions.className = "row-actions";
    actions.innerHTML = `
      <button class="row-btn" data-action="move" title="Move to watchlist">⇄</button>
      <button class="row-btn" data-action="delete" title="Delete">🗑</button>
    `;
    r.appendChild(actions);

    // right click
    r.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      openRowMenu(e.clientX, e.clientY, row.symbol);
    });

    // click row buttons
    actions.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const act = btn.dataset.action;
      if (act === "delete") confirmDelete(row.symbol);
      if (act === "move") alert(`${row.symbol} Move to watchlist (use right click menu for list)`);
    });

    watchlistBody.appendChild(r);
  });
}

function removeSymbol(symbol) {
  watchlistData = watchlistData.filter(x => x.symbol !== symbol);
  renderWatchlist();
}

/* Column events */
if (tableToggle) tableToggle.addEventListener("change", renderWatchlist);
document.querySelectorAll("#columns-menu input[data-col]").forEach(cb => cb.addEventListener("change", renderWatchlist));

/* ================= ADD SYMBOL MODAL ================= */

const modal = document.getElementById("modal-overlay");
const addBtn = document.getElementById("add-symbol-btn");
const input = document.getElementById("symbol-input");
const confirmBtn = document.getElementById("symbol-add-confirm");
const cancelBtn = document.getElementById("symbol-add-cancel");

function openModal() {
  modal?.classList.add("open");
  input.value = "";
  input.focus();
}
function closeModal() {
  modal?.classList.remove("open");
}

addBtn?.addEventListener("click", openModal);
cancelBtn?.addEventListener("click", closeModal);
modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

confirmBtn?.addEventListener("click", () => {
  const sym = (input.value || "").trim().toUpperCase();
  if (!sym) return;

  if (watchlistData.some(x => x.symbol === sym)) {
    closeModal();
    return;
  }

  watchlistData.unshift({
    symbol: sym,
    color: "red",
    last: "0",
    change: "+0.00",
    changePct: "+0.00%",
    volume: "—",
    extended: "—",
    aiCote: "—",
    aiProb: "—",
  });

  closeModal();
  renderWatchlist();
});

input?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") confirmBtn.click();
  if (e.key === "Escape") closeModal();
});

/* ================= RIGHT CLICK MENU ================= */

const rowMenu = document.getElementById("row-menu");
const rowSubmenu = document.getElementById("row-submenu");
const moveText = document.getElementById("row-menu-move-text");
const compareBtn = document.getElementById("row-menu-compare");
const deleteBtn = document.getElementById("row-menu-delete");

let menuSymbol = null;

// Example other watchlists (colors)
const otherWatchlists = [
  { name: "Blue list", color: "blue" },
  { name: "Green list", color: "green" },
  { name: "Orange list", color: "orange" },
];

function openRowMenu(x, y, symbol) {
  menuSymbol = symbol;
  if (!rowMenu) return;

  // dynamic labels
  moveText.textContent = `${symbol}  Move to watchlist`;
  compareBtn.textContent = `${symbol}  Compare`;
  deleteBtn.textContent = `${symbol}  Delete`;

  // build submenu
  rowSubmenu.innerHTML = "";
  otherWatchlists.forEach(wl => {
    const b = document.createElement("button");
    b.className = "submenu-item";
    b.innerHTML = `<span class="dot ${wl.color}"></span><span>${wl.name}</span>`;
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      alert(`${symbol} moved to ${wl.name} (next step: real move)`);
      closeRowMenu();
    });
    rowSubmenu.appendChild(b);
  });

  rowMenu.style.left = `${x}px`;
  rowMenu.style.top = `${y}px`;
  rowMenu.classList.add("open");
}

function closeRowMenu() {
  if (!rowMenu) return;
  rowMenu.classList.remove("open");
  menuSymbol = null;
}

function confirmDelete(symbol) {
  const ok = window.confirm(`Are you sure you want to delete ${symbol}?`);
  if (ok) removeSymbol(symbol);
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

  // move is handled by submenu hover/click
});

/* ================= INIT ================= */

renderWatchlist();
