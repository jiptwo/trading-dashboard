console.log("MAIN.JS LOADED");

/* ================= SIMPLE STORAGE HELPERS ================= */
const LS = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

/* ================= DROPDOWNS (keepopen support) ================= */
document.addEventListener("click", (e) => {
  document.querySelectorAll(".dropdown-menu.open").forEach(menu => {
    const btn = document.querySelector(`.dropdown-btn[data-dropdown="${menu.id}"]`);

    const keepOpen = e.target.closest('[data-keepopen="true"]');
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
  if (w > 260 && w < 900) rightBar.style.width = w + "px";
});

resizerH?.addEventListener("mousedown", () => resizingH = true);
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

/* ================= FAVORITES (Chart & Timeframe) ================= */
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
    item.dataset.label = name;
    item.innerHTML = `
      <img src="${chartTypes[name]}" class="icon" />
      <span class="menu-label">${name}</span>
    `;
    chartMenu.appendChild(item);
  });
}

/**
 * Favorites logic (fix: timeframe duplicates)
 * - We store the base label in item.dataset.label before injecting ☆/★
 * - We always use dataset.label as the key for add/remove
 */
function initFavorites(menuId, favoritesContainerId, iconMode = false) {
  const menu = document.getElementById(menuId);
  const favoritesBar = document.getElementById(favoritesContainerId);
  if (!menu || !favoritesBar) return;

  menu.querySelectorAll(".menu-item").forEach(item => {
    // Ensure stable label (timeframe menu items are plain text)
    if (!item.dataset.label) {
      item.dataset.label = (item.dataset.type || item.textContent || "").replace("★", "").replace("☆", "").trim();
    }

    if (item.querySelector(".star")) return;

    const star = document.createElement("span");
    star.className = "star";
    star.textContent = "☆";
    item.appendChild(star);

    star.addEventListener("click", e => {
      e.stopPropagation();

      const label = item.dataset.type || item.dataset.label;
      const existing = favoritesBar.querySelector(`[data-label="${CSS.escape(label)}"]`);

      if (existing) {
        existing.remove();
        star.textContent = "☆";
        star.classList.remove("active");
        return;
      }

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
    });
  });
}

initFavorites("chart-menu", "chart-favorites", true);
initFavorites("timeframe-menu", "timeframe-favorites");

/* ================= WATCHLIST (minimal stable, table alignment) ================= */
const watchlistBody = document.getElementById("watchlist-body");
const tableToggle = document.getElementById("table-toggle");
const watchlistSearch = document.getElementById("watchlist-search");

const columnKeys = ["last","change","changePct","volume","extended","aiCote","aiProb"];
const columnLabels = {
  last:"Last", change:"Change", changePct:"Change %", volume:"Volume", extended:"Extended", aiCote:"Ai Cote", aiProb:"Ai Prob"
};

const listsKey = "tp_watchlists_v1";
const activeListKey = "tp_active_watchlist_v1";

const defaultLists = [
  { id: "wl_red", name: "Red list", color: "#ef4444", symbols: ["AAPL","BCAL","TSLA"], columns: { table:true, last:true, change:true, changePct:true, volume:true, extended:false, aiCote:false, aiProb:false } }
];

let watchlists = LS.get(listsKey, defaultLists);
let activeWatchlistId = LS.get(activeListKey, watchlists[0].id);

function getActiveList() {
  return watchlists.find(w => w.id === activeWatchlistId) || watchlists[0];
}

function saveWatchlists() {
  LS.set(listsKey, watchlists);
  LS.set(activeListKey, activeWatchlistId);
}

function ensureListState() {
  if (!watchlists.length) watchlists = defaultLists;
  if (!watchlists.find(w => w.id === activeWatchlistId)) activeWatchlistId = watchlists[0].id;
  saveWatchlists();
}

function setActiveWatchlist(id) {
  activeWatchlistId = id;
  saveWatchlists();
  renderWatchlistHeader();
  renderWatchlistTable();
}

function renderWatchlistHeader() {
  const list = getActiveList();
  const nameEl = document.getElementById("active-watchlist-name");
  const dotEl = document.getElementById("active-watchlist-dot");
  if (nameEl) nameEl.textContent = list.name;
  if (dotEl) dotEl.style.background = list.color;

  const quick = document.getElementById("wl-quick-switch");
  if (quick) {
    quick.innerHTML = "";
    watchlists.forEach(w => {
      const b = document.createElement("button");
      b.className = "wl-quick-btn";
      b.title = w.name;
      b.style.background = w.color;
      b.style.opacity = (w.id === activeWatchlistId) ? "1" : "0.55";
      b.addEventListener("click", () => setActiveWatchlist(w.id));
      quick.appendChild(b);
    });
  }

  // apply per-watchlist columns to UI checkboxes
  if (tableToggle) tableToggle.checked = !!list.columns.table;
  columnKeys.forEach(k => {
    const cb = document.querySelector(`#columns-menu input[data-col="${k}"]`);
    if (cb) cb.checked = !!list.columns[k];
  });
}

const priceState = {}; // simulated prices

function mockPrice(symbol) {
  if (!priceState[symbol]) {
    priceState[symbol] = { price: symbol === "AAPL" ? 182.34 : (symbol === "TSLA" ? 245.12 : 18.85) };
  }
  return priceState[symbol].price;
}

function renderWatchlistTable() {
  if (!watchlistBody) return;
  const list = getActiveList();
  watchlistBody.innerHTML = "";

  // header
  const header = document.createElement("div");
  header.className = "watchlist-table-header";

  const hSymbol = document.createElement("span");
  hSymbol.className = "col-symbol";
  hSymbol.textContent = "Symbol";
  header.appendChild(hSymbol);

  const showTable = !!list.columns.table;
  columnKeys.forEach(k => {
    const s = document.createElement("span");
    s.className = "col";
    s.textContent = columnLabels[k];
    if (!showTable || !list.columns[k]) s.classList.add("col-hidden");
    header.appendChild(s);
  });

  watchlistBody.appendChild(header);

  const filter = (watchlistSearch?.value || "").trim().toUpperCase();
  list.symbols
    .filter(sym => !filter || sym.includes(filter))
    .forEach(sym => {
      const row = document.createElement("div");
      row.className = "watchlist-row";
      row.dataset.symbol = sym;

      const cSymbol = document.createElement("span");
      cSymbol.className = "col-symbol";
      cSymbol.innerHTML = `
        <span class="dot" style="background:${list.color}"></span>
        <span class="symbol" title="${sym}">${sym}</span>
      `;
      row.appendChild(cSymbol);

      const price = mockPrice(sym);
      const change = sym === "AAPL" ? 0.76 : 0.00;
      const chgPct = sym === "AAPL" ? 0.42 : 0.00;

      const cells = {
        last: price.toFixed(2),
        change: (change >= 0 ? "+" : "") + change.toFixed(2),
        changePct: (chgPct >= 0 ? "+" : "") + chgPct.toFixed(2) + "%",
        volume: "—",
        extended: "—",
        aiCote: "—",
        aiProb: "—"
      };

      columnKeys.forEach(k => {
        const cell = document.createElement("span");
        cell.className = "col";
        cell.textContent = cells[k];
        if (!showTable || !list.columns[k]) cell.classList.add("col-hidden");
        row.appendChild(cell);
      });

      // right click menu
      row.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        openRowMenu(e.clientX, e.clientY, sym);
      });

      watchlistBody.appendChild(row);
    });
}

watchlistSearch?.addEventListener("input", renderWatchlistTable);

function persistColumnsFromUI() {
  const list = getActiveList();
  list.columns.table = !!tableToggle?.checked;
  columnKeys.forEach(k => {
    const cb = document.querySelector(`#columns-menu input[data-col="${k}"]`);
    list.columns[k] = !!cb?.checked;
  });
  saveWatchlists();
}

tableToggle?.addEventListener("change", () => {
  persistColumnsFromUI();
  renderWatchlistTable();
});

document.querySelectorAll("#columns-menu input[data-col]").forEach(cb => {
  cb.addEventListener("change", () => {
    persistColumnsFromUI();
    renderWatchlistTable();
  });
});

/* Add symbol modal (simple) */
const addBtn = document.getElementById("add-symbol-btn");
const overlay = document.getElementById("modal-overlay");
const symbolInput = document.getElementById("symbol-input");
const symbolAddConfirm = document.getElementById("symbol-add-confirm");
const symbolAddCancel = document.getElementById("symbol-add-cancel");

function openAddSymbol() {
  overlay.classList.add("open");
  symbolInput.value = "";
  symbolInput.focus();
}
function closeAddSymbol() { overlay.classList.remove("open"); }

addBtn?.addEventListener("click", openAddSymbol);
symbolAddCancel?.addEventListener("click", closeAddSymbol);
overlay?.addEventListener("click", (e) => { if (e.target === overlay) closeAddSymbol(); });

function addSymbolToActive(sym) {
  sym = (sym || "").trim().toUpperCase();
  if (!sym) return;

  const list = getActiveList();
  if (!list.symbols.includes(sym)) {
    list.symbols.unshift(sym);
    saveWatchlists();
    renderWatchlistTable();
  }
}

symbolAddConfirm?.addEventListener("click", () => {
  addSymbolToActive(symbolInput.value);
  closeAddSymbol();
});
symbolInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addSymbolToActive(symbolInput.value);
    closeAddSymbol();
  }
  if (e.key === "Escape") closeAddSymbol();
});

/* ================= ROW MENU (right click) ================= */
const rowMenu = document.getElementById("row-menu");
const rowSubmenu = document.getElementById("row-submenu");
const rowMenuMove = document.getElementById("row-menu-move");
const rowMenuMoveText = document.getElementById("row-menu-move-text");
const rowMenuCompare = document.getElementById("row-menu-compare");
const rowMenuDelete = document.getElementById("row-menu-delete");
const rowMenuNote = document.getElementById("row-menu-note");

let currentRowSymbol = null;

function closeRowMenu() {
  rowMenu?.classList.remove("open");
  rowMenuMove?.classList.remove("submenu-open");
  currentRowSymbol = null;
}

document.addEventListener("click", (e) => {
  if (rowMenu && rowMenu.classList.contains("open") && !rowMenu.contains(e.target)) {
    closeRowMenu();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeRowMenu();
});

function openRowMenu(x, y, symbol) {
  currentRowSymbol = symbol;

  rowMenuNote.textContent = `${symbol} Add Note`;
  rowMenuMoveText.textContent = `${symbol} Move to watchlist`;
  rowMenuCompare.textContent = `${symbol} Compare`;
  rowMenuDelete.textContent = `${symbol} Delete`;

  // submenu: list other watchlists
  rowSubmenu.innerHTML = "";
  watchlists
    .filter(w => w.id !== activeWatchlistId)
    .forEach(w => {
      const item = document.createElement("div");
      item.className = "submenu-item";
      item.innerHTML = `<span class="color-dot" style="background:${w.color}"></span><span>${w.name}</span>`;
      item.addEventListener("click", () => {
        moveSymbolToWatchlist(symbol, w.id);
        closeRowMenu();
      });
      rowSubmenu.appendChild(item);
    });

  rowMenu.style.left = x + "px";
  rowMenu.style.top = y + "px";
  rowMenu.classList.add("open");
}

function moveSymbolToWatchlist(symbol, targetId) {
  const from = getActiveList();
  const to = watchlists.find(w => w.id === targetId);
  if (!to) return;

  from.symbols = from.symbols.filter(s => s !== symbol);
  if (!to.symbols.includes(symbol)) to.symbols.unshift(symbol);

  saveWatchlists();
  renderWatchlistTable();
}

/* Submenu stability */
(function fixMoveSubmenuHover() {
  if (!rowMenuMove || !rowSubmenu) return;

  let hoverInside = false;
  let closeTimer = null;

  const open = () => {
    clearTimeout(closeTimer);
    rowMenuMove.classList.add("submenu-open");
  };

  const scheduleClose = () => {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      if (!hoverInside) rowMenuMove.classList.remove("submenu-open");
    }, 250);
  };

  rowMenuMove.addEventListener("mouseenter", () => {
    hoverInside = true;
    open();
  });
  rowMenuMove.addEventListener("mouseleave", () => {
    hoverInside = false;
    scheduleClose();
  });

  rowSubmenu.addEventListener("mouseenter", () => {
    hoverInside = true;
    open();
  });
  rowSubmenu.addEventListener("mouseleave", () => {
    hoverInside = false;
    scheduleClose();
  });
})();

/* Compare placeholder */
rowMenuCompare?.addEventListener("click", () => {
  console.log("COMPARE", currentRowSymbol);
  closeRowMenu();
});

/* Delete with confirm */
const confirmOverlay = document.getElementById("confirm-overlay");
const confirmTitle = document.getElementById("confirm-title");
const confirmText = document.getElementById("confirm-text");
const confirmYes = document.getElementById("confirm-yes");
const confirmNo = document.getElementById("confirm-no");
let confirmAction = null;

function openConfirm(title, text, onYes) {
  confirmTitle.textContent = title;
  confirmText.textContent = text;
  confirmOverlay.classList.add("open");
  confirmAction = onYes;
}

function closeConfirm() {
  confirmOverlay.classList.remove("open");
  confirmAction = null;
}

confirmNo?.addEventListener("click", closeConfirm);
confirmOverlay?.addEventListener("click", (e) => { if (e.target === confirmOverlay) closeConfirm(); });
confirmYes?.addEventListener("click", () => {
  if (confirmAction) confirmAction();
  closeConfirm();
});

rowMenuDelete?.addEventListener("click", () => {
  const sym = currentRowSymbol;
  closeRowMenu();
  openConfirm("Delete symbol", `Are you sure you want to delete ${sym}?`, () => {
    const list = getActiveList();
    list.symbols = list.symbols.filter(s => s !== sym);
    saveWatchlists();
    renderWatchlistTable();
  });
});

/* Note placeholder */
rowMenuNote?.addEventListener("click", () => {
  console.log("ADD NOTE", currentRowSymbol);
  closeRowMenu();
});

/* ================= ALERTS (TradingView-like) ================= */
const ALERTS_LS_KEY = "tp_alerts_v1";
const ALERTS_LOG_LS_KEY = "tp_alerts_log_v1";
let alerts = LS.get(ALERTS_LS_KEY, []);
let alertLog = LS.get(ALERTS_LOG_LS_KEY, []);

function saveAlerts() {
  LS.set(ALERTS_LS_KEY, alerts);
  LS.set(ALERTS_LOG_LS_KEY, alertLog);
}

function formatCond(a) {
  const op = a.condition === "price_above" ? "crosses above" : "crosses below";
  return `Price ${op} ${Number(a.value).toFixed(2)}`;
}

function nowStr() {
  const d = new Date();
  return d.toLocaleString();
}

function pushLog(msg) {
  alertLog.unshift({ id: uid(), msg, time: nowStr() });
  alertLog = alertLog.slice(0, 200);
  saveAlerts();
}

function renderAlerts(zone = "zone1") {
  const listEl = document.getElementById(`alerts-list-${zone}`);
  const emptyEl = document.getElementById(`alerts-empty-${zone}`);
  const logEl = document.getElementById(`alerts-log-${zone}`);
  const logEmpty = document.getElementById(`alerts-log-empty-${zone}`);
  const searchEl = document.getElementById(`alerts-search-${zone}`);

  if (!listEl || !emptyEl || !logEl || !logEmpty) return;

  const q = (searchEl?.value || "").trim().toUpperCase();

  // Alerts list
  listEl.innerHTML = "";
  const visibleAlerts = alerts.filter(a => {
    if (!q) return true;
    return a.symbol.includes(q) || formatCond(a).toUpperCase().includes(q);
  });

  if (visibleAlerts.length === 0) {
    emptyEl.classList.remove("panel-hidden");
  } else {
    emptyEl.classList.add("panel-hidden");
    visibleAlerts.forEach(a => {
      const card = document.createElement("div");
      card.className = "alert-card";

      const price = mockPrice(a.symbol);

      card.innerHTML = `
        <div class="alert-main">
          <div class="alert-title">
            <span class="dot" style="background:#22c55e; opacity:${a.active ? 1 : 0.35}"></span>
            <span>${a.symbol}</span>
          </div>
          <div class="alert-sub">${formatCond(a)}</div>
          <div class="alert-meta">
            <span>Last: ${price.toFixed(2)}</span>
            <span>Notify: ${a.notify}</span>
          </div>
        </div>

        <div class="alert-actions">
          <div class="alert-switch" title="Enable / disable">
            <div class="switch ${a.active ? "on" : ""}" data-alert-switch="${a.id}"></div>
          </div>

          <button class="alert-menu-btn" data-alert-menu="${a.id}" title="More">⋯</button>
        </div>
      `;

      listEl.appendChild(card);
    });
  }

  // Log
  logEl.innerHTML = "";
  if (alertLog.length === 0) {
    logEmpty.classList.remove("panel-hidden");
  } else {
    logEmpty.classList.add("panel-hidden");
    alertLog.forEach(l => {
      const row = document.createElement("div");
      row.className = "log-row";
      row.innerHTML = `
        <div>${l.msg}</div>
        <div class="log-time">${l.time}</div>
      `;
      logEl.appendChild(row);
    });
  }

  // Hook switches
  document.querySelectorAll(`[data-alert-switch]`).forEach(sw => {
    sw.addEventListener("click", () => {
      const id = sw.dataset.alertSwitch;
      const a = alerts.find(x => x.id === id);
      if (!a) return;
      a.active = !a.active;
      saveAlerts();
      renderAlerts(zone);
    });
  });

  // Hook menu
  document.querySelectorAll(`[data-alert-menu]`).forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.alertMenu;
      const a = alerts.find(x => x.id === id);
      if (!a) return;

      openConfirm("Delete alert", `Delete alert for ${a.symbol}?`, () => {
        alerts = alerts.filter(x => x.id !== id);
        saveAlerts();
        renderAlerts(zone);
      });
    });
  });
}

/* Alerts tab switching */
function setAlertsTab(tab) {
  document.querySelectorAll(".alerts-tab").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(`.alerts-tab[data-alert-tab="${tab}"]`).forEach(b => b.classList.add("active"));

  const list = document.getElementById("alerts-list-zone1");
  const empty = document.getElementById("alerts-empty-zone1");
  const log = document.getElementById("alerts-log-zone1");
  const logEmpty = document.getElementById("alerts-log-empty-zone1");

  if (tab === "alerts") {
    list?.classList.remove("panel-hidden");
    empty?.classList.toggle("panel-hidden", alerts.length > 0);
    log?.classList.add("panel-hidden");
    logEmpty?.classList.add("panel-hidden");
  } else {
    list?.classList.add("panel-hidden");
    empty?.classList.add("panel-hidden");
    log?.classList.remove("panel-hidden");
    logEmpty?.classList.toggle("panel-hidden", alertLog.length > 0);
  }
}

document.querySelectorAll(".alerts-tab").forEach(b => {
  b.addEventListener("click", () => {
    setAlertsTab(b.dataset.alertTab);
  });
});

/* Create alert modal */
const alertOverlay = document.getElementById("alert-overlay");
const alertSymbol = document.getElementById("alert-symbol");
const alertCondition = document.getElementById("alert-condition");
const alertValue = document.getElementById("alert-value");
const alertNotify = document.getElementById("alert-notify");
const alertCreateConfirm = document.getElementById("alert-create-confirm");
const alertCreateCancel = document.getElementById("alert-create-cancel");

function openCreateAlert(prefillSymbol = "") {
  alertOverlay.classList.add("open");
  alertSymbol.value = prefillSymbol || "";
  alertCondition.value = "price_above";
  alertValue.value = "";
  alertNotify.value = "popup";
  setTimeout(() => alertSymbol.focus(), 0);
}
function closeCreateAlert() { alertOverlay.classList.remove("open"); }

alertCreateCancel?.addEventListener("click", closeCreateAlert);
alertOverlay?.addEventListener("click", (e) => { if (e.target === alertOverlay) closeCreateAlert(); });

function createAlert() {
  const sym = (alertSymbol.value || "").trim().toUpperCase();
  const cond = alertCondition.value;
  const val = Number(alertValue.value);

  if (!sym || Number.isNaN(val)) {
    openConfirm("Invalid", "Please enter a valid symbol and value.", () => {});
    return;
  }

  alerts.unshift({
    id: uid(),
    symbol: sym,
    condition: cond,
    value: val,
    notify: alertNotify.value,
    active: true,
    createdAt: Date.now(),
    lastFiredAt: null
  });

  saveAlerts();
  closeCreateAlert();
  renderAlerts("zone1");
}

alertCreateConfirm?.addEventListener("click", createAlert);

document.getElementById("create-alert-btn-zone1")?.addEventListener("click", () => openCreateAlert());
document.getElementById("alerts-add-btn-zone1")?.addEventListener("click", () => openCreateAlert());

document.getElementById("alerts-search-zone1")?.addEventListener("input", () => renderAlerts("zone1"));

/* Check now (manual) */
document.getElementById("alerts-check-btn-zone1")?.addEventListener("click", () => {
  checkAlertsOnce(true);
  renderAlerts("zone1");
});

/* Mock feed + triggers */
function stepPrices() {
  Object.keys(priceState).forEach(sym => {
    const p = priceState[sym].price;
    const drift = (Math.random() - 0.5) * (sym === "TSLA" ? 1.8 : 0.25);
    priceState[sym].price = Math.max(0.01, p + drift);
  });
}

function checkAlertsOnce(forceLog = false) {
  // Ensure price state exists for every alert symbol
  alerts.forEach(a => mockPrice(a.symbol));

  stepPrices();

  const now = Date.now();
  alerts.forEach(a => {
    if (!a.active) return;

    const p = priceState[a.symbol].price;
    const threshold = Number(a.value);

    const firedRecently = a.lastFiredAt && (now - a.lastFiredAt) < 3000; // spam guard
    if (firedRecently) return;

    const hit =
      (a.condition === "price_above" && p >= threshold) ||
      (a.condition === "price_below" && p <= threshold);

    if (hit) {
      a.lastFiredAt = now;
      const msg = `[TRIGGER] ${a.symbol} — ${formatCond(a)} (last ${p.toFixed(2)})`;
      pushLog(msg);

      // simple popup effect
      if (a.notify === "popup") {
        console.log(msg);
      }
    } else if (forceLog) {
      // optional debug if you want later
    }
  });

  saveAlerts();
}

/* Background simulated feed */
setInterval(() => {
  checkAlertsOnce(false);
  // keep UI fresh if alerts panel is open
  const pAlerts = document.getElementById("panel-alerts-zone1");
  if (pAlerts && !pAlerts.classList.contains("panel-hidden")) {
    renderAlerts("zone1");
  }
}, 1500);

/* ================= RIGHT BAR: WATCHLIST + ALERTS placement ================= */
const ALERTS_BTN_ID = "btn-alerts";
let alertsPlacement = "zone1"; // default = Zone 1 (top)

function createAlertsButton() {
  const btn = document.createElement("button");
  btn.className = "btn";
  btn.id = ALERTS_BTN_ID;
  btn.title = "Alerts";
  btn.innerHTML = `<img src="./icons/alert.svg" class="icon" />`;
  btn.addEventListener("click", () => showAlertsPanel());
  return btn;
}

function mountAlertsButton() {
  const slotTop = document.getElementById("slot-alert-top");
  const slotBottom = document.getElementById("slot-alert-bottom");
  if (!slotTop || !slotBottom) return;

  const existing = document.getElementById(ALERTS_BTN_ID);
  if (existing) existing.remove();

  const btn = createAlertsButton();
  if (alertsPlacement === "zone1") slotTop.appendChild(btn);
  else slotBottom.appendChild(btn);
}

function showAlertsPanel() {
  const pWatch = document.getElementById("panel-watchlist");
  const pA1 = document.getElementById("panel-alerts-zone1");

  pWatch?.classList.add("panel-hidden");
  pA1?.classList.remove("panel-hidden");

  renderAlerts("zone1");
  setAlertsTab("alerts");
}

function showWatchlistPanel() {
  const pWatch = document.getElementById("panel-watchlist");
  const pA1 = document.getElementById("panel-alerts-zone1");
  pWatch?.classList.remove("panel-hidden");
  pA1?.classList.add("panel-hidden");
}

document.getElementById("btn-watchlist")?.addEventListener("click", () => showWatchlistPanel());

/* Panel settings modal */
const panelSettingsOverlay = document.getElementById("panel-settings-overlay");
const panelSettingsBtn = document.getElementById("btn-rightbar-settings");
const panelSettingsSave = document.getElementById("panel-settings-save");
const panelSettingsCancel = document.getElementById("panel-settings-cancel");

function openPanelSettings() {
  panelSettingsOverlay.classList.add("open");
  document.querySelectorAll('input[name="alertsPlacement"]').forEach(r => {
    r.checked = (r.value === alertsPlacement);
  });
}
function closePanelSettings() { panelSettingsOverlay.classList.remove("open"); }

panelSettingsBtn?.addEventListener("click", openPanelSettings);
panelSettingsCancel?.addEventListener("click", closePanelSettings);
panelSettingsOverlay?.addEventListener("click", (e) => { if (e.target === panelSettingsOverlay) closePanelSettings(); });

panelSettingsSave?.addEventListener("click", () => {
  const selected = document.querySelector('input[name="alertsPlacement"]:checked');
  if (selected) alertsPlacement = selected.value;
  mountAlertsButton();
  closePanelSettings();
});

/* ================= INIT ================= */
ensureListState();
renderWatchlistHeader();
renderWatchlistTable();

mountAlertsButton();
showWatchlistPanel(); // default: watchlist visible
