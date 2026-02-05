console.log("MAIN.JS LOADED");

/* ================= DROPDOWNS ================= */

document.addEventListener("click", (e) => {
  document.querySelectorAll(".dropdown-menu.open").forEach(menu => {
    const btn = document.querySelector(`.dropdown-btn[data-dropdown="${menu.id}"]`);
    const keepOpen = e.target.closest('[data-keepopen="true"]');

    // si clic sur checkbox/ligne "keepopen", ne ferme pas
    if (keepOpen) return;

    if (!menu.contains(e.target) && (!btn || !btn.contains(e.target))) {
      menu.classList.remove("open");
    }
  });

  // fermer menu clic droit
  closeRowMenu();
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

resizerV?.addEventListener("mousedown", () => resizingV = true);
document.addEventListener("mouseup", () => resizingV = false);
document.addEventListener("mousemove", e => {
  if (!resizingV) return;
  const w = window.innerWidth - e.clientX;
  if (w > 320 && w < 800) rightBar.style.width = w + "px";
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

/* ================= FAVORITES (tu as déjà ça, on laisse) ================= */

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

      const label = item.dataset.type || item.textContent.trim();
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
          btn.textContent = label.replace("★", "").replace("☆", "").trim();
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

/* ================= WATCHLIST TABLE (PRO, ALIGNÉ) ================= */

const watchlistBody = document.getElementById("watchlist-body");
const tableToggle = document.getElementById("table-toggle");

/** Colonnes (ordre EXACT) */
const columnsOrder = [
  { key: "symbol",   label: "Symbol",   always: true },
  { key: "last",     label: "Last" },
  { key: "change",   label: "Change" },
  { key: "changePct",label: "Change %" },
  { key: "volume",   label: "Volume" },
  { key: "extended", label: "Extended" },
  { key: "aiCote",   label: "Ai Cote" },
  { key: "aiProb",   label: "Ai Prob" },
];

/** Mapping key -> checkbox data-col */
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
  { symbol: "TSLA", color: "red", last: "0", change: "+0.00", changePct: "+0.00%", volume: "—", extended: "—", aiCote: "—", aiProb: "—" },
  { symbol: "AAPL", color: "red", last: "182.34", change: "+0.76", changePct: "+0.42%", volume: "—", extended: "—", aiCote: "—", aiProb: "—" },
];

/** Lire quels champs sont visibles selon table view + checkboxes */
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

/** Render header + rows (structure identique -> plus de mélange) */
function renderWatchlist() {
  if (!watchlistBody) return;

  const visible = getVisibleColumns();

  // clear
  watchlistBody.innerHTML = "";

  // header
  const header = document.createElement("div");
  header.className = "watchlist-table-header";

  // créer toutes les cellules dans le même ordre (on cache celles non visibles)
  columnsOrder.forEach(col => {
    if (col.key === "symbol") {
      const cell = document.createElement("span");
      cell.className = "col-symbol";
      cell.textContent = col.label;
      header.appendChild(cell);
      return;
    }

    const cell = document.createElement("span");
    cell.className = `col ${col.key}`;
    cell.textContent = col.label;
    if (!visible.has(col.key)) cell.classList.add("col-hidden");
    header.appendChild(cell);
  });

  // actions column header (vide)
  const actionsH = document.createElement("span");
  actionsH.className = "col actions";
  actionsH.textContent = "";
  header.appendChild(actionsH);

  watchlistBody.appendChild(header);

  // rows
  watchlistData.forEach(row => {
    const r = document.createElement("div");
    r.className = "watchlist-row";
    r.dataset.symbol = row.symbol;

    // symbol cell
    const sym = document.createElement("span");
    sym.className = "col-symbol";

    const dot = document.createElement("span");
    dot.className = `dot ${row.color || "red"}`;

    const symText = document.createElement("span");
    symText.className = "symbol";
    symText.textContent = row.symbol;

    sym.appendChild(dot);
    sym.appendChild(symText);
    r.appendChild(sym);

    // other cells in same order
    columnsOrder.slice(1).forEach(col => {
      const cell = document.createElement("span");
      cell.className = `cell ${col.key}`;
      cell.textContent = row[col.key] ?? "—";
      if (!visible.has(col.key)) cell.classList.add("col-hidden");
      r.appendChild(cell);
    });

    // actions (always last column)
    const actions = document.createElement("span");
    actions.className = "row-actions";
    actions.innerHTML = `
      <button class="row-btn" data-action="move" title="Move to watchlist">⇄</button>
      <button class="row-btn" data-action="delete" title="Delete">🗑</button>
    `;
    r.appendChild(actions);

    // left click select (simple)
    r.addEventListener("click", () => {
      document.querySelectorAll(".watchlist-row.selected").forEach(x => x.classList.remove("selected"));
      r.classList.add("selected");
    });

    // right click menu
    r.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      openRowMenu(e.clientX, e.clientY, row.symbol);
    });

    // actions click
    actions.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const act = btn.dataset.action;
      if (act === "delete") removeSymbol(row.symbol);
      if (act === "move") alert(`Move ${row.symbol} to another watchlist (next step)`);
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
let menuSymbol = null;

function openRowMenu(x, y, symbol) {
  menuSymbol = symbol;
  if (!rowMenu) return;

  rowMenu.style.left = `${x}px`;
  rowMenu.style.top = `${y}px`;
  rowMenu.classList.add("open");
}

function closeRowMenu() {
  if (!rowMenu) return;
  rowMenu.classList.remove("open");
  menuSymbol = null;
}

rowMenu?.addEventListener("click", (e) => {
  const btn = e.target.closest(".row-menu-item");
  if (!btn) return;
  const act = btn.dataset.action;

  if (act === "delete" && menuSymbol) removeSymbol(menuSymbol);
  if (act === "move" && menuSymbol) alert(`Move ${menuSymbol} to another watchlist (next step)`);

  closeRowMenu();
});

/* ================= INIT ================= */

renderWatchlist();
