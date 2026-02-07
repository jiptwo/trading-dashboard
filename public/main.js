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
    item.dataset.labelBase = name;

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

    // stable label
    const baseLabel = item.dataset.type || item.dataset.labelBase || item.textContent.trim();
    item.dataset.labelBase = baseLabel;

    const star = document.createElement("span");
    star.className = "star";
    star.textContent = "☆";
    item.appendChild(star);

    const syncStarState = () => {
      const existing = favoritesBar.querySelector(`[data-label="${baseLabel}"]`);
      if (existing) {
        star.textContent = "★";
        star.classList.add("active");
      } else {
        star.textContent = "☆";
        star.classList.remove("active");
      }
    };
    syncStarState();

    star.addEventListener("click", e => {
      e.stopPropagation();

      const existing = favoritesBar.querySelector(`[data-label="${baseLabel}"]`);
      if (existing) {
        existing.remove();
        syncStarState();
        return;
      }

      const btn = document.createElement("button");
      btn.className = "btn";
      btn.dataset.label = baseLabel;

      if (iconMode && chartTypes[baseLabel]) {
        const img = document.createElement("img");
        img.src = chartTypes[baseLabel];
        img.className = "icon";
        btn.appendChild(img);
      } else {
        // timeframe favorites should show only "5m" etc. (no star)
        btn.textContent = baseLabel;
      }

      favoritesBar.appendChild(btn);
      syncStarState();
    });
  });
}

initFavorites("chart-menu", "chart-favorites", true);
initFavorites("timeframe-menu", "timeframe-favorites");

/* ================= USER MENU (TradingView-like) ================= */
const THEME_KEY = "tp_theme_v1";
const DRAWINGS_KEY = "tp_drawings_panel_v1";
const LANG_KEY = "tp_language_v1";

function applyTheme(mode) {
  const isLight = mode === "light";
  document.documentElement.classList.toggle("theme-light", isLight);
}

function initUserMenu(){
  const userMenu = document.getElementById("user-menu");
  const userBtn = document.querySelector('.dropdown-btn[data-dropdown="user-menu"]'); // uses global dropdown behavior
  if (!userMenu || !userBtn) return;

  const usernameEl = document.getElementById("user-username");
  const initialsEl = document.getElementById("user-initials");

  const LS_USER = "tp_user_v1";
  const state = LS.get(LS_USER, { username: "jpbeaudoin", darkTheme: true, drawingsPanel: false, language: "en" });

  function save(){ LS.set(LS_USER, state); }

  function initialsFrom(name){
    const s=(name||"").trim();
    if(!s) return "JP";
    const parts=s.split(/\s+/).slice(0,2);
    return parts.map(p=>p[0].toUpperCase()).join("");
  }

  function applyUser(){
    if (usernameEl) usernameEl.textContent = state.username || "jpbeaudoin";
    if (initialsEl) initialsEl.textContent = initialsFrom(state.username);

    document.body.classList.toggle("light", !state.darkTheme);
    document.body.classList.toggle("dark", !!state.darkTheme);

    const darkToggle = document.getElementById("user-dark-theme");
    if (darkToggle) darkToggle.checked = !!state.darkTheme;

    const drawToggle = document.getElementById("user-drawings-panel");
    if (drawToggle) drawToggle.checked = !!state.drawingsPanel;

    const langLabel = document.getElementById("user-language-label");
    if (langLabel){
      langLabel.textContent = state.language === "fr" ? "Français" : (state.language === "es" ? "Español" : "English");
    }
  }

  function openOverlay(id){
    const ov=document.getElementById(id);
    if(!ov) return;
    ov.classList.add("open");
  }
  function closeOverlay(id){
    const ov=document.getElementById(id);
    if(!ov) return;
    ov.classList.remove("open");
  }

  // Profile modal
  /* ---------- CHANGE USERNAME (used from Settings) ---------- */
  const profileOverlay = document.getElementById("profile-overlay");
  const profileCancel = document.getElementById("profile-cancel");
  const profileSave = document.getElementById("profile-save");
  const profileUsername = document.getElementById("profile-username");

  function openChangeUsername(){
    if (!profileOverlay) return;
    if (profileUsername) profileUsername.value = state.username || "";
    openOverlay("profile-overlay");
    setTimeout(()=>profileUsername?.focus(),0);
  }
  profileCancel?.addEventListener("click", ()=>closeOverlay("profile-overlay"));
  profileOverlay?.addEventListener("click", (e)=>{ if(e.target===profileOverlay) closeOverlay("profile-overlay"); });
  profileSave?.addEventListener("click", ()=>{
    const v=(profileUsername?.value||"").trim();
    if (v) state.username=v;
    save(); applyUser();
    // Keep Settings screen in sync
    const settingsUsername = document.getElementById("settings-username");
    if (settingsUsername) settingsUsername.textContent = state.username;
    closeOverlay("profile-overlay");
  });

  /* ---------- PUBLIC PROFILE (community) ---------- */
  function openPublicProfile(){
    const overlay = document.getElementById("public-profile-overlay");
    if (!overlay) return;
    // sync fields
    const initials = (state.username || "JP").slice(0,2).toUpperCase();
    const ppAvatar = document.getElementById("pp-avatar");
    const ppUser = document.getElementById("pp-username");
    if (ppAvatar) ppAvatar.textContent = initials;
    if (ppUser) ppUser.textContent = state.username || "jpbeaudoin";
    openOverlay("public-profile-overlay");
  }
  document.getElementById("public-profile-close")?.addEventListener("click", ()=>closeOverlay("public-profile-overlay"));

  // Settings modal
  const settingsOverlay = document.getElementById("settings-overlay");
  const settingsClose = document.getElementById("settings-close");
  const settingsUsername = document.getElementById("settings-username");
  const settingsAvatar = document.getElementById("settings-avatar");
  const settingsChangeUsername = document.getElementById("settings-change-username");
  const settingsSavePublicProfile = document.getElementById("settings-save-public-profile");

  const settingsX = document.getElementById("settings-x");
  const settingsYouTube = document.getElementById("settings-youtube");
  const settingsWebsite = document.getElementById("settings-website");

  function openSettings(){
    if (!settingsOverlay) return;
    if (settingsUsername) settingsUsername.textContent = state.username || "";
    if (settingsAvatar) settingsAvatar.textContent = initialsFrom(state.username);

    // fill links
    if (settingsX) settingsX.value = (state.socials?.x || "");
    if (settingsYouTube) settingsYouTube.value = (state.socials?.youtube || "");
    if (settingsWebsite) settingsWebsite.value = (state.socials?.website || "");

    settingsOverlay.querySelectorAll(".settings-nav-item").forEach(b=>b.classList.remove("active"));
    const first=settingsOverlay.querySelector('.settings-nav-item[data-settings-tab="publicProfile"]');
    first?.classList.add("active");
    settingsOverlay.querySelectorAll(".settings-panel").forEach(p=>p.classList.add("panel-hidden"));
    settingsOverlay.querySelector('.settings-panel[data-settings-panel="publicProfile"]')?.classList.remove("panel-hidden");

    openOverlay("settings-overlay");
  }

  settingsClose?.addEventListener("click", ()=>closeOverlay("settings-overlay"));
  settingsOverlay?.addEventListener("click", (e)=>{ if(e.target===settingsOverlay) closeOverlay("settings-overlay"); });
  settingsOverlay?.querySelectorAll(".settings-nav-item").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const tab=btn.dataset.settingsTab;
      settingsOverlay.querySelectorAll(".settings-nav-item").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      settingsOverlay.querySelectorAll(".settings-panel").forEach(p=>p.classList.add("panel-hidden"));
      settingsOverlay.querySelector(`.settings-panel[data-settings-panel="${tab}"]`)?.classList.remove("panel-hidden");
    });
  });

  settingsChangeUsername?.addEventListener("click", ()=>openUsernameModal());

  settingsSavePublicProfile?.addEventListener("click", ()=>{
    state.socials = state.socials || {x:"", youtube:"", website:""};
    state.socials.x = (settingsX?.value || "").trim();
    state.socials.youtube = (settingsYouTube?.value || "").trim();
    state.socials.website = (settingsWebsite?.value || "").trim();
    save();
    // very light feedback
    toast("Saved.");
  });

  // Language modal
  const languageOverlay = document.getElementById("language-overlay");
  const languageCancel = document.getElementById("language-cancel");
  const languageSave = document.getElementById("language-save");

  function openLanguage(){
    if (!languageOverlay) return;
    languageOverlay.querySelectorAll('input[name="appLanguage"]').forEach(r=>{
      r.checked = (r.value === state.language);
    });
    openOverlay("language-overlay");
  }
  languageCancel?.addEventListener("click", ()=>closeOverlay("language-overlay"));
  languageOverlay?.addEventListener("click", (e)=>{ if(e.target===languageOverlay) closeOverlay("language-overlay"); });
  languageSave?.addEventListener("click", ()=>{
    const sel = languageOverlay.querySelector('input[name="appLanguage"]:checked');
    if (sel) state.language = sel.value;
    save(); applyUser();
    closeOverlay("language-overlay");
  });

  // Shortcuts modal
  const shortcutsOverlay = document.getElementById("shortcuts-overlay");
  const shortcutsClose = document.getElementById("shortcuts-close");
  function openShortcuts(){ if(shortcutsOverlay) openOverlay("shortcuts-overlay"); }
  shortcutsClose?.addEventListener("click", ()=>closeOverlay("shortcuts-overlay"));
  shortcutsOverlay?.addEventListener("click",(e)=>{ if(e.target===shortcutsOverlay) closeOverlay("shortcuts-overlay"); });

  // toggles
  const darkToggle = document.getElementById("user-dark-theme");
  darkToggle?.addEventListener("change", ()=>{
    state.darkTheme = !!darkToggle.checked;
    save(); applyUser();
  });
  const drawToggle = document.getElementById("user-drawings-panel");
  drawToggle?.addEventListener("change", ()=>{
    state.drawingsPanel = !!drawToggle.checked;
    save(); applyUser();
  });

  // menu item clicks (delegation)
  userMenu.addEventListener("click", (e)=>{
    const item = e.target.closest("[data-user-action]");
    if (!item || !userMenu.contains(item)) return;

    const act = item.dataset.userAction;
    if (act === "profile") openProfile();
    else if (act === "settings") openSettings();
    else if (act === "language") openLanguage();
    else if (act === "shortcuts") openShortcuts();
    else if (act === "home") console.log("HOME");
    else if (act === "help") console.log("HELP");
    else if (act === "whatsnew") console.log("WHATS NEW");
    else if (act === "signout") openConfirm("Sign out", "Are you sure you want to sign out?", ()=>console.log("SIGN OUT"));
  });

  applyUser();
}

/* ================= WATCHLIST DATA MODEL ================= */
const watchlistBody = document.getElementById("watchlist-body");
const tableToggle = document.getElementById("table-toggle");
const watchlistSearch = document.getElementById("watchlist-search");
const chartSub = document.getElementById("chart-sub");
const symbolTooltip = document.getElementById("symbol-tooltip");

const columnKeys = ["last","change","changePct","volume","extended","aiCote","aiProb"];
const columnLabels = {
  last:"Last", change:"Change", changePct:"Change %", volume:"Volume", extended:"Extended", aiCote:"Ai Cote", aiProb:"Ai Prob"
};

const COL_VAR = {
  symbol: "--w-symbol",
  last: "--w-last",
  change: "--w-change",
  changePct: "--w-changepct",
  volume: "--w-volume",
  extended: "--w-extended",
  aiCote: "--w-aicote",
  aiProb: "--w-aiprob"
};

const listsKey = "tp_watchlists_v2";
const activeListKey = "tp_active_watchlist_v2";
const alertsPlacementKey = "tp_alerts_placement_v1";

const COLOR_PALETTE = [
  "#ef4444", "#3b82f6", "#22c55e", "#a855f7", "#f59e0b",
  "#06b6d4", "#f43f5e", "#84cc16", "#eab308", "#94a3b8"
];

const DEFAULT_COLUMNS = { table:true, last:true, change:true, changePct:true, volume:true, extended:false, aiCote:false, aiProb:false };

const COMPANY_MAP = {
  AAPL: "Apple Inc.",
  TSLA: "Tesla, Inc.",
  AMZN: "Amazon.com, Inc.",
  MSFT: "Microsoft Corporation",
  NVDA: "NVIDIA Corporation",
  META: "Meta Platforms, Inc.",
  GOOGL: "Alphabet Inc.",
  NFLX: "Netflix, Inc."
};

function defaultList() {
  return {
    id: "wl_red",
    name: "Red list",
    color: "#ef4444",
    columns: { ...DEFAULT_COLUMNS },
    sections: [
      { id: "sec_main", name: "Main", symbols: ["AAPL","BCAL","TSLA"] }
    ],
    notes: {} // { SYMBOL: "note text" }
  };
}

let watchlists = LS.get(listsKey, [defaultList()]);
let activeWatchlistId = LS.get(activeListKey, watchlists[0]?.id || "wl_red");
let alertsPlacement = LS.get(alertsPlacementKey, "zone1");

/* Backward compatibility: migrate old shape {symbols:[]} to sections */
function normalizeWatchlists() {
  if (!Array.isArray(watchlists) || watchlists.length === 0) watchlists = [defaultList()];

  watchlists = watchlists.map(w => {
    const nw = { ...w };

    if (!nw.id) nw.id = uid();
    if (!nw.name) nw.name = "List";
    if (!nw.color) nw.color = "#94a3b8";
    if (!nw.columns) nw.columns = { ...DEFAULT_COLUMNS };
    if (!nw.notes) nw.notes = {};

    // migrate symbols -> sections
    if (!Array.isArray(nw.sections)) {
      const syms = Array.isArray(nw.symbols) ? nw.symbols.slice() : [];
      nw.sections = [{ id: uid(), name: "Main", symbols: syms }];
      delete nw.symbols;
    }
    // ensure section fields
    nw.sections = nw.sections.map(s => ({
      id: s.id || uid(),
      name: (s.name || "Section").toString(),
      symbols: Array.isArray(s.symbols) ? s.symbols.map(x => String(x).toUpperCase()) : []
    }));

    // de-dup symbols per list
    const seen = new Set();
    nw.sections.forEach(sec => {
      sec.symbols = sec.symbols.filter(sym => {
        sym = String(sym).toUpperCase();
        if (seen.has(sym)) return false;
        seen.add(sym);
        return true;
      });
    });

    return nw;
  });

  if (!watchlists.find(w => w.id === activeWatchlistId)) activeWatchlistId = watchlists[0].id;
  saveWatchlists();
}

function getActiveList() {
  return watchlists.find(w => w.id === activeWatchlistId) || watchlists[0];
}

function saveWatchlists() {
  LS.set(listsKey, watchlists);
  LS.set(activeListKey, activeWatchlistId);
  LS.set(alertsPlacementKey, alertsPlacement);
}

function setActiveWatchlist(id) {
  activeWatchlistId = id;
  saveWatchlists();
  renderWatchlistHeader();
  renderWatchlistTable();
}

function getUsedColors() {
  return new Set(watchlists.map(w => w.color));
}

/* ================= WATCHLIST HEADER UI ================= */
function renderWatchlistHeader() {
  const list = getActiveList();
  const nameEl = document.getElementById("active-watchlist-name");
  const dotEl = document.getElementById("active-watchlist-dot");
  if (nameEl) nameEl.textContent = list.name;
  if (dotEl) dotEl.style.background = list.color;

  // quick switch dots
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

/* ================= PRICE MOCK ================= */
const priceState = {}; // simulated
function mockPrice(symbol) {
  if (!priceState[symbol]) {
    // deterministic-ish start
    const base = (symbol.charCodeAt(0) + symbol.charCodeAt(symbol.length - 1)) % 200;
    priceState[symbol] = { price: Math.max(1, base + 50 + Math.random() * 40) };
    if (symbol === "AAPL") priceState[symbol].price = 182.34;
    if (symbol === "TSLA") priceState[symbol].price = 245.12;
  }
  return priceState[symbol].price;
}

/* ================= TABLE RENDERING ================= */
function persistColumnsFromUI() {
  const list = getActiveList();
  list.columns.table = !!tableToggle?.checked;
  columnKeys.forEach(k => {
    const cb = document.querySelector(`#columns-menu input[data-col="${k}"]`);
    list.columns[k] = !!cb?.checked;
  });
  saveWatchlists();
}

function makeCell(text, classes = []) {
  const cell = document.createElement("span");
  cell.className = ["watchlist-cell", ...classes].join(" ");
  cell.textContent = text;
  return cell;
}

function applyHidden(el, hidden) {
  el.classList.toggle("col-hidden", !!hidden);
}

function renderWatchlistTable() {
  if (!watchlistBody) return;
  const list = getActiveList();
  watchlistBody.innerHTML = "";

  // HEADER
  const header = document.createElement("div");
  header.className = "watchlist-table-header";

  // Symbol header (resizable)
  const hSymbol = makeCell("Symbol", ["col-symbol"]);
  hSymbol.dataset.colKey = "symbol";
  hSymbol.appendChild(makeResizer("symbol"));
  header.appendChild(hSymbol);

  const showTable = !!list.columns.table;
  columnKeys.forEach(k => {
    const cell = makeCell(columnLabels[k], ["col"]);
    cell.dataset.colKey = k;
    applyHidden(cell, !showTable || !list.columns[k]);
    cell.appendChild(makeResizer(k));
    header.appendChild(cell);
  });

  watchlistBody.appendChild(header);

  // FILTER
  const filter = (watchlistSearch?.value || "").trim().toUpperCase();

  // SECTIONS + ROWS
  list.sections.forEach(sec => {
    const visibleSyms = sec.symbols.filter(sym => !filter || sym.includes(filter));
    // If filter is active and section empty, hide section row for cleanliness
    if (filter && visibleSyms.length === 0) return;

    // Section row
    const srow = document.createElement("div");
    srow.className = "watchlist-section-row";
    srow.dataset.sectionId = sec.id;
    srow.draggable = true;

    const sectionCell = document.createElement("span");
    sectionCell.className = "section-cell";
    sectionCell.innerHTML = `
      <span class="section-name" title="Click to rename">${escapeHtml(sec.name)}</span>
      <span class="section-actions">
        <button class="section-btn section-btn-danger" data-section-action="delete" title="Delete section">Delete</button>
      </span>
    `;
    srow.appendChild(sectionCell);

    srow.addEventListener("click", (e) => {
      const nameEl = e.target.closest(".section-name");
      if (nameEl) {
        renameSection(sec.id);
        return;
      }
      const del = e.target.closest('[data-section-action="delete"]');
      if (del) {
        deleteSection(sec.id);
      }
    });

    // section drag/drop
    wireSectionDnD(srow);

    watchlistBody.appendChild(srow);

    // Symbol rows
    visibleSyms.forEach(sym => {
      const row = document.createElement("div");
      row.className = "watchlist-row";
      row.dataset.symbol = sym;
      row.dataset.sectionId = sec.id;
      row.draggable = true;

      // Symbol cell
      const symCell = document.createElement("span");
      symCell.className = "watchlist-cell col-symbol";
      symCell.innerHTML = `
        <span class="dot" style="background:${list.color}"></span>
        <span class="symbol" data-symbol="${sym}">${sym}</span>
        <span class="note-icon" data-note-icon="${sym}" title="Note">📝</span>
      `;

      // Update note icon state
      const noteText = (list.notes && list.notes[sym]) ? String(list.notes[sym]) : "";
      // If there is no note yet, we hide the icon entirely (TradingView-like).
      // The user can still add a note via right-click menu.
      const noteEl = symCell.querySelector(".note-icon");
      if (!noteText) {
        noteEl.remove();
      } else {
        noteEl.style.opacity = "0.9";
        noteEl.title = "View note";
      }

      // Symbol click -> chart
      symCell.querySelector(".symbol").addEventListener("click", () => {
        loadSymbolIntoChart(sym);
      });

      // Note icon click (only if present)
      const noteIcon = symCell.querySelector(".note-icon");
      if (noteIcon) {
        noteIcon.addEventListener("click", (e) => {
          e.stopPropagation();
          openNoteModal(sym);
        });
      }

      // Tooltip (company + note)
      wireSymbolTooltip(symCell.querySelector(".symbol"), sym);

      row.appendChild(symCell);

      // Other columns
      const price = mockPrice(sym);
      const change = sym === "AAPL" ? 0.76 : (Math.random() - 0.5) * 1.4;
      const chgPct = (change / price) * 100;

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
        const cell = makeCell(cells[k], ["col"]);
        applyHidden(cell, !showTable || !list.columns[k]);
        row.appendChild(cell);
      });

      // Right-click menu
      row.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        openRowMenu(e.clientX, e.clientY, sym);
      });

      // Row click (optional highlight + chart)
      row.addEventListener("click", () => loadSymbolIntoChart(sym));

      // DnD
      wireSymbolDnD(row);

      watchlistBody.appendChild(row);
    });
  });

  wireColumnResizers(header);
}

/* ================= CHART LOAD (single click) ================= */
function loadSymbolIntoChart(symbol) {
  const list = getActiveList();
  if (chartSub) chartSub.textContent = `Loaded: ${symbol} — ${COMPANY_MAP[symbol] || "Company"} (from ${list.name})`;
}

/* ================= SYMBOL TOOLTIP ================= */
let tooltipTimer = null;

function wireSymbolTooltip(el, symbol) {
  if (!el || !symbolTooltip) return;

  const show = (clientX, clientY) => {
    const list = getActiveList();
    const company = COMPANY_MAP[symbol] || "Company information";
    const note = (list.notes && list.notes[symbol]) ? String(list.notes[symbol]) : "";

    symbolTooltip.innerHTML = `
      <div class="tooltip-title">${escapeHtml(symbol)} — ${escapeHtml(company)}</div>
      <div class="tooltip-sub">Watchlist: ${escapeHtml(list.name)}</div>
      ${note ? `<div class="tooltip-sub" style="margin-top:6px;">Note: ${escapeHtml(note)}</div>` : `<div class="tooltip-sub" style="margin-top:6px; opacity:0.8;">No note — right click → Add Note</div>`}
    `;

    const pad = 12;
    const x = Math.min(window.innerWidth - 300, clientX + pad);
    const y = Math.min(window.innerHeight - 140, clientY + pad);
    symbolTooltip.style.left = x + "px";
    symbolTooltip.style.top = y + "px";
    symbolTooltip.classList.add("open");
  };

  const hide = () => symbolTooltip.classList.remove("open");

  el.addEventListener("mouseenter", (e) => {
    clearTimeout(tooltipTimer);
    tooltipTimer = setTimeout(() => show(e.clientX, e.clientY), 180);
  });
  el.addEventListener("mousemove", (e) => {
    if (!symbolTooltip.classList.contains("open")) return;
    const pad = 12;
    symbolTooltip.style.left = Math.min(window.innerWidth - 300, e.clientX + pad) + "px";
    symbolTooltip.style.top = Math.min(window.innerHeight - 140, e.clientY + pad) + "px";
  });
  el.addEventListener("mouseleave", () => {
    clearTimeout(tooltipTimer);
    hide();
  });
}

/* ================= COLUMN RESIZERS ================= */
function makeResizer(colKey) {
  const r = document.createElement("span");
  r.className = "col-resizer";
  r.dataset.resizeKey = colKey;
  return r;
}

function wireColumnResizers(headerEl) {
  if (!headerEl || !watchlistBody) return;

  let active = null;

  const onMove = (e) => {
    if (!active) return;
    const dx = e.clientX - active.startX;
    const next = Math.max(active.min, active.startW + dx);
    watchlistBody.style.setProperty(active.varName, `${next}px`);
  };

  const onUp = () => {
    if (!active) return;
    active = null;
    document.body.style.cursor = "";
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  };

  headerEl.querySelectorAll(".col-resizer").forEach(res => {
    res.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const key = res.dataset.resizeKey;
      const varName = COL_VAR[key];
      if (!varName) return;

      const current = getComputedStyle(watchlistBody).getPropertyValue(varName).trim();
      const startW = parseInt(current.replace("px", ""), 10) || 80;

      const min = (key === "symbol") ? 90 : 56;

      active = { key, varName, startX: e.clientX, startW, min };
      document.body.style.cursor = "col-resize";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
  });
}

/* ================= WATCHLIST MENU ACTIONS ================= */
const watchlistMenu = document.getElementById("watchlist-menu");
watchlistMenu?.addEventListener("click", (e) => {
  const item = e.target.closest(".menu-item");
  if (!item) return;
  const action = item.dataset.wlAction;
  if (!action) return;

  // keep menu closed after click
  document.querySelectorAll(".dropdown-menu.open").forEach(m => m.classList.remove("open"));

  if (action === "rename") openRenameModal();
  if (action === "create") openCreateWatchlistModal();
  if (action === "delete") deleteActiveWatchlist();
  if (action === "addSection") openAddSectionModal();
  if (action === "clear") clearActiveWatchlist();
});

/* ================= SECTIONS ================= */
const sectionOverlay = document.getElementById("section-overlay");
const sectionInput = document.getElementById("section-input");
const sectionSave = document.getElementById("section-save");
const sectionCancel = document.getElementById("section-cancel");

function openAddSectionModal() {
  if (!sectionOverlay) return;
  sectionOverlay.classList.add("open");
  sectionInput.value = "";
  setTimeout(() => sectionInput.focus(), 0);
}
function closeAddSectionModal() { sectionOverlay?.classList.remove("open"); }

sectionCancel?.addEventListener("click", closeAddSectionModal);
sectionOverlay?.addEventListener("click", (e) => { if (e.target === sectionOverlay) closeAddSectionModal(); });

sectionSave?.addEventListener("click", () => {
  const name = (sectionInput.value || "").trim();
  if (!name) return;
  const list = getActiveList();
  list.sections.push({ id: uid(), name, symbols: [] });
  saveWatchlists();
  closeAddSectionModal();
  renderWatchlistTable();
});

function renameSection(sectionId) {
  const list = getActiveList();
  const sec = list.sections.find(s => s.id === sectionId);
  if (!sec) return;
  const next = prompt("Rename section", sec.name);
  if (!next) return;
  sec.name = next.trim() || sec.name;
  saveWatchlists();
  renderWatchlistTable();
}

function deleteSection(sectionId) {
  const list = getActiveList();
  if (list.sections.length <= 1) {
    openConfirm("Cannot delete", "You must keep at least one section.", () => {});
    return;
  }
  const sec = list.sections.find(s => s.id === sectionId);
  if (!sec) return;

  openConfirm("Delete section", `Delete section "${sec.name}"? Symbols will move to the first section.`, () => {
    const first = list.sections[0];
    sec.symbols.forEach(sym => {
      if (!first.symbols.includes(sym)) first.symbols.push(sym);
    });
    list.sections = list.sections.filter(s => s.id !== sectionId);
    saveWatchlists();
    renderWatchlistTable();
  });
}

/* ================= SYMBOL DnD (within list + between sections) ================= */
let dragPayload = null;

function wireSymbolDnD(rowEl) {
  rowEl.addEventListener("dragstart", (e) => {
    dragPayload = {
      type: "symbol",
      symbol: rowEl.dataset.symbol,
      fromSectionId: rowEl.dataset.sectionId
    };
    rowEl.classList.add("dragging");
    e.dataTransfer?.setData("text/plain", dragPayload.symbol);
    e.dataTransfer?.setDragImage(rowEl, 8, 8);
  });

  rowEl.addEventListener("dragend", () => {
    rowEl.classList.remove("dragging");
    dragPayload = null;
    document.querySelectorAll(".drop-target").forEach(x => x.classList.remove("drop-target"));
  });

  rowEl.addEventListener("dragover", (e) => {
    if (!dragPayload || dragPayload.type !== "symbol") return;
    e.preventDefault();
    rowEl.classList.add("drop-target");
  });

  rowEl.addEventListener("dragleave", () => rowEl.classList.remove("drop-target"));

  rowEl.addEventListener("drop", (e) => {
    if (!dragPayload || dragPayload.type !== "symbol") return;
    e.preventDefault();
    rowEl.classList.remove("drop-target");

    const targetSymbol = rowEl.dataset.symbol;
    const targetSectionId = rowEl.dataset.sectionId;

    moveSymbolWithinList(dragPayload.symbol, dragPayload.fromSectionId, targetSectionId, targetSymbol);
  });
}

function wireSectionDnD(sectionRowEl) {
  // drop symbols onto section header -> move to top
  sectionRowEl.addEventListener("dragover", (e) => {
    if (!dragPayload) return;
    e.preventDefault();
    sectionRowEl.classList.add("drop-target");
  });
  sectionRowEl.addEventListener("dragleave", () => sectionRowEl.classList.remove("drop-target"));
  sectionRowEl.addEventListener("drop", (e) => {
    if (!dragPayload) return;
    e.preventDefault();
    sectionRowEl.classList.remove("drop-target");

    const list = getActiveList();
    const targetSectionId = sectionRowEl.dataset.sectionId;

    if (dragPayload.type === "symbol") {
      moveSymbolWithinList(dragPayload.symbol, dragPayload.fromSectionId, targetSectionId, null);
    } else if (dragPayload.type === "section") {
      moveSection(dragPayload.sectionId, targetSectionId);
    }
  });

  // section drag
  sectionRowEl.addEventListener("dragstart", (e) => {
    dragPayload = { type: "section", sectionId: sectionRowEl.dataset.sectionId };
    sectionRowEl.classList.add("dragging");
    e.dataTransfer?.setData("text/plain", dragPayload.sectionId);
  });
  sectionRowEl.addEventListener("dragend", () => {
    sectionRowEl.classList.remove("dragging");
    dragPayload = null;
    document.querySelectorAll(".drop-target").forEach(x => x.classList.remove("drop-target"));
  });
}

function moveSection(fromId, beforeId) {
  const list = getActiveList();
  const fromIdx = list.sections.findIndex(s => s.id === fromId);
  const toIdx = list.sections.findIndex(s => s.id === beforeId);
  if (fromIdx < 0 || toIdx < 0 || fromId === beforeId) return;

  const [sec] = list.sections.splice(fromIdx, 1);
  const insertAt = (fromIdx < toIdx) ? toIdx - 1 : toIdx;
  list.sections.splice(insertAt, 0, sec);
  saveWatchlists();
  renderWatchlistTable();
}

function moveSymbolWithinList(symbol, fromSectionId, toSectionId, beforeSymbol) {
  const list = getActiveList();
  const fromSec = list.sections.find(s => s.id === fromSectionId);
  const toSec = list.sections.find(s => s.id === toSectionId);
  if (!fromSec || !toSec) return;

  // remove
  fromSec.symbols = fromSec.symbols.filter(s => s !== symbol);

  // insert
  if (!beforeSymbol) {
    toSec.symbols.unshift(symbol);
  } else {
    const idx = toSec.symbols.indexOf(beforeSymbol);
    if (idx >= 0) toSec.symbols.splice(idx, 0, symbol);
    else toSec.symbols.unshift(symbol);
  }

  // de-dup within list across sections
  const seen = new Set();
  list.sections.forEach(sec => {
    sec.symbols = sec.symbols.filter(s => {
      if (seen.has(s)) return false;
      seen.add(s);
      return true;
    });
  });

  saveWatchlists();
  renderWatchlistTable();
}

/* ================= ADD SYMBOL MODAL ================= */
const addBtn = document.getElementById("add-symbol-btn");
const overlay = document.getElementById("modal-overlay");
const symbolInput = document.getElementById("symbol-input");
const symbolAddConfirm = document.getElementById("symbol-add-confirm");
const symbolAddCancel = document.getElementById("symbol-add-cancel");

function openAddSymbol() {
  overlay?.classList.add("open");
  symbolInput.value = "";
  symbolInput.focus();
}
function closeAddSymbol() { overlay?.classList.remove("open"); }

addBtn?.addEventListener("click", openAddSymbol);
symbolAddCancel?.addEventListener("click", closeAddSymbol);
overlay?.addEventListener("click", (e) => { if (e.target === overlay) closeAddSymbol(); });

function addSymbolToActive(sym) {
  sym = (sym || "").trim().toUpperCase();
  if (!sym) return;

  const list = getActiveList();
  const first = list.sections[0];
  const exists = list.sections.some(s => s.symbols.includes(sym));
  if (!exists) {
    first.symbols.unshift(sym);
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

/* ================= WATCHLIST SEARCH + COLUMNS ================= */
watchlistSearch?.addEventListener("input", renderWatchlistTable);

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

/* ================= WATCHLIST CREATE / RENAME / DELETE ================= */
const renameOverlay = document.getElementById("rename-overlay");
const renameInput = document.getElementById("rename-input");
const renameSave = document.getElementById("rename-save");
const renameCancel = document.getElementById("rename-cancel");

function openRenameModal() {
  const list = getActiveList();
  renameOverlay?.classList.add("open");
  renameInput.value = list.name;
  setTimeout(() => renameInput.focus(), 0);
}
function closeRenameModal() { renameOverlay?.classList.remove("open"); }

renameCancel?.addEventListener("click", closeRenameModal);
renameOverlay?.addEventListener("click", (e) => { if (e.target === renameOverlay) closeRenameModal(); });
renameSave?.addEventListener("click", () => {
  const list = getActiveList();
  const next = (renameInput.value || "").trim();
  if (!next) return;
  list.name = next;
  saveWatchlists();
  closeRenameModal();
  renderWatchlistHeader();
});

const createWlOverlay = document.getElementById("create-wl-overlay");
const createWlName = document.getElementById("create-wl-name");
const createWlColors = document.getElementById("create-wl-colors");
const createWlSave = document.getElementById("create-wl-save");
const createWlCancel = document.getElementById("create-wl-cancel");
const createWlHint = document.getElementById("create-wl-color-hint");

let selectedCreateColor = null;

function openCreateWatchlistModal() {
  createWlOverlay?.classList.add("open");
  createWlName.value = "";
  selectedCreateColor = null;
  renderColorPicker();
}
function closeCreateWatchlistModal() { createWlOverlay?.classList.remove("open"); }

createWlCancel?.addEventListener("click", closeCreateWatchlistModal);
createWlOverlay?.addEventListener("click", (e) => { if (e.target === createWlOverlay) closeCreateWatchlistModal(); });

function renderColorPicker() {
  if (!createWlColors) return;
  createWlColors.innerHTML = "";
  const used = getUsedColors();

  let availableCount = 0;

  COLOR_PALETTE.forEach(c => {
    const sw = document.createElement("div");
    sw.className = "color-swatch";
    sw.style.background = c;

    const disabled = used.has(c);
    if (disabled) sw.classList.add("disabled");
    else availableCount++;

    if (selectedCreateColor === c) sw.classList.add("selected");

    sw.addEventListener("click", () => {
      if (disabled) return;
      selectedCreateColor = c;
      renderColorPicker();
    });

    createWlColors.appendChild(sw);
  });

  if (createWlHint) {
    createWlHint.textContent = availableCount === 0
      ? "All 10 colors are already used. Delete a watchlist to free a color."
      : "Pick a color (max 10, no duplicates).";
  }
}

createWlSave?.addEventListener("click", () => {
  if (!selectedCreateColor) {
    openConfirm("Missing color", "Please select a color.", () => {});
    return;
  }
  const name = (createWlName.value || "").trim();
  const prettyName = name || `${colorName(selectedCreateColor)} list`;

  const wl = {
    id: uid(),
    name: prettyName,
    color: selectedCreateColor,
    columns: { ...DEFAULT_COLUMNS },
    sections: [{ id: uid(), name: "Main", symbols: [] }],
    notes: {}
  };

  watchlists.push(wl);
  activeWatchlistId = wl.id;

  saveWatchlists();
  closeCreateWatchlistModal();
  renderWatchlistHeader();
  renderWatchlistTable();
});

function deleteActiveWatchlist() {
  if (watchlists.length <= 1) {
    openConfirm("Cannot delete", "You must keep at least one watchlist.", () => {});
    return;
  }
  const list = getActiveList();
  openConfirm("Delete watchlist", `Are you sure you want to delete "${list.name}"?`, () => {
    watchlists = watchlists.filter(w => w.id !== list.id);
    activeWatchlistId = watchlists[0].id;
    saveWatchlists();
    renderWatchlistHeader();
    renderWatchlistTable();
  });
}

function clearActiveWatchlist() {
  const list = getActiveList();
  openConfirm("Clear list", `Remove all symbols from "${list.name}"?`, () => {
    list.sections.forEach(s => s.symbols = []);
    list.notes = {};
    saveWatchlists();
    renderWatchlistTable();
  });
}

function colorName(hex) {
  const map = {
    "#ef4444":"Red", "#3b82f6":"Blue", "#22c55e":"Green", "#a855f7":"Purple", "#f59e0b":"Orange",
    "#06b6d4":"Cyan", "#f43f5e":"Pink", "#84cc16":"Lime", "#eab308":"Yellow", "#94a3b8":"Gray"
  };
  return map[hex] || "New";
}

/* ================= NOTES ================= */
const noteOverlay = document.getElementById("note-overlay");
const noteTitle = document.getElementById("note-title");
const noteText = document.getElementById("note-text");
const noteSave = document.getElementById("note-save");
const noteCancel = document.getElementById("note-cancel");
let noteSymbol = null;

function openNoteModal(symbol) {
  const list = getActiveList();
  noteSymbol = symbol;
  noteTitle.textContent = `${symbol} — Add note`;
  noteText.value = (list.notes && list.notes[symbol]) ? String(list.notes[symbol]) : "";
  noteOverlay?.classList.add("open");
  setTimeout(() => noteText.focus(), 0);
}

function closeNoteModal() {
  noteOverlay?.classList.remove("open");
  noteSymbol = null;
}

noteCancel?.addEventListener("click", closeNoteModal);
noteOverlay?.addEventListener("click", (e) => { if (e.target === noteOverlay) closeNoteModal(); });
noteSave?.addEventListener("click", () => {
  if (!noteSymbol) return;
  const list = getActiveList();
  const txt = (noteText.value || "").trim();
  if (txt) list.notes[noteSymbol] = txt;
  else delete list.notes[noteSymbol];
  saveWatchlists();
  closeNoteModal();
  renderWatchlistTable();
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
      item.innerHTML = `<span class="color-dot" style="background:${w.color}"></span><span>${escapeHtml(w.name)}</span>`;
      item.addEventListener("click", () => {
        moveSymbolToWatchlist(symbol, w.id);
        closeRowMenu();
      });
      rowSubmenu.appendChild(item);
    });

  // Keep menu inside viewport
  const menuW = 250;
  const menuH = 160;
  const left = Math.min(window.innerWidth - menuW - 8, x);
  const top = Math.min(window.innerHeight - menuH - 8, y);

  rowMenu.style.left = left + "px";
  rowMenu.style.top = top + "px";
  rowMenu.classList.add("open");
}

function moveSymbolToWatchlist(symbol, targetId) {
  const from = getActiveList();
  const to = watchlists.find(w => w.id === targetId);
  if (!to) return;

  // remove from all sections (from)
  from.sections.forEach(s => s.symbols = s.symbols.filter(x => x !== symbol));

  // add to first section (to)
  const first = to.sections[0] || (to.sections = [{ id: uid(), name: "Main", symbols: [] }], to.sections[0]);
  if (!first.symbols.includes(symbol)) first.symbols.unshift(symbol);

  // move note if exists
  if (from.notes && from.notes[symbol]) {
    to.notes = to.notes || {};
    to.notes[symbol] = from.notes[symbol];
    delete from.notes[symbol];
  }

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
    }, 260);
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
  loadSymbolIntoChart(currentRowSymbol);
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
    list.sections.forEach(s => s.symbols = s.symbols.filter(x => x !== sym));
    if (list.notes) delete list.notes[sym];
    saveWatchlists();
    renderWatchlistTable();
  });
});

rowMenuNote?.addEventListener("click", () => {
  const sym = currentRowSymbol;
  closeRowMenu();
  openNoteModal(sym);
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

/* Small in-app toast (used when an alert triggers) */
function ensureToastHost() {
  let host = document.getElementById("toast-host");
  if (host) return host;
  host = document.createElement("div");
  host.id = "toast-host";
  document.body.appendChild(host);
  return host;
}

function showToast(text) {
  const host = ensureToastHost();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = text;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 250);
  }, 3200);
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
            <span>${escapeHtml(a.symbol)}</span>
          </div>
          <div class="alert-sub">${escapeHtml(formatCond(a))}</div>
          <div class="alert-meta">
            <span>Last: ${price.toFixed(2)}</span>
            <span>Notify: ${escapeHtml(a.notify)}</span>
          </div>
        </div>

        <div class="alert-actions">
          <div class="alert-switch" title="Enable / disable">
            <div class="switch ${a.active ? "on" : ""}" data-alert-switch="${a.id}"></div>
          </div>

          <button class="alert-menu-btn" data-alert-menu="${a.id}" title="Delete">⋯</button>
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
        <div>${escapeHtml(l.msg)}</div>
        <div class="log-time">${escapeHtml(l.time)}</div>
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

  // Hook menu = delete
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

function setAlertsTab(zone, tab) {
  document.querySelectorAll(`.alerts-tab[data-alert-zone="${zone}"]`).forEach(b => b.classList.remove("active"));
  document.querySelectorAll(`.alerts-tab[data-alert-zone="${zone}"][data-alert-tab="${tab}"]`).forEach(b => b.classList.add("active"));

  const list = document.getElementById(`alerts-list-${zone}`);
  const empty = document.getElementById(`alerts-empty-${zone}`);
  const log = document.getElementById(`alerts-log-${zone}`);
  const logEmpty = document.getElementById(`alerts-log-empty-${zone}`);

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
  b.addEventListener("click", () => setAlertsTab(b.dataset.alertZone, b.dataset.alertTab));
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
  renderAlerts("zone2");
}

alertCreateConfirm?.addEventListener("click", createAlert);

document.getElementById("create-alert-btn-zone1")?.addEventListener("click", () => openCreateAlert());
document.getElementById("alerts-add-btn-zone1")?.addEventListener("click", () => openCreateAlert());
document.getElementById("alerts-search-zone1")?.addEventListener("input", () => renderAlerts("zone1"));
document.getElementById("alerts-check-btn-zone1")?.addEventListener("click", () => { checkAlertsOnce(true); renderAlerts("zone1"); });

document.getElementById("create-alert-btn-zone2")?.addEventListener("click", () => openCreateAlert());
document.getElementById("alerts-add-btn-zone2")?.addEventListener("click", () => openCreateAlert());
document.getElementById("alerts-search-zone2")?.addEventListener("input", () => renderAlerts("zone2"));
document.getElementById("alerts-check-btn-zone2")?.addEventListener("click", () => { checkAlertsOnce(true); renderAlerts("zone2"); });

/* Mock feed + triggers */
function stepPrices() {
  Object.keys(priceState).forEach(sym => {
    const p = priceState[sym].price;
    const drift = (Math.random() - 0.5) * (sym === "TSLA" ? 1.8 : 0.25);
    priceState[sym].price = Math.max(0.01, p + drift);
  });
}

function checkAlertsOnce() {
  alerts.forEach(a => mockPrice(a.symbol));
  stepPrices();

  const now = Date.now();
  alerts.forEach(a => {
    if (!a.active) return;

    const p = priceState[a.symbol].price;
    const threshold = Number(a.value);

    const firedRecently = a.lastFiredAt && (now - a.lastFiredAt) < 3000;
    if (firedRecently) return;

    const hit =
      (a.condition === "price_above" && p >= threshold) ||
      (a.condition === "price_below" && p <= threshold);

    if (hit) {
      a.lastFiredAt = now;
      const msg = `[TRIGGER] ${a.symbol} — ${formatCond(a)} (last ${p.toFixed(2)})`;
      pushLog(msg);
      if (a.notify === "popup") {
        // Visible toast inside the app (more user friendly than console)
        showToast(`${a.symbol}: ${formatCond(a)} (last ${p.toFixed(2)})`, "success");
      }
    }
  });

  saveAlerts();
}

/* Background simulated feed */
setInterval(() => {
  checkAlertsOnce(false);
  // keep UI fresh if alerts panel is open
  const pA1 = document.getElementById("panel-alerts-zone1");
  const pA2 = document.getElementById("panel-alerts-zone2");
  if (pA1 && !pA1.classList.contains("panel-hidden")) renderAlerts("zone1");
  if (pA2 && !pA2.classList.contains("panel-hidden")) renderAlerts("zone2");
}, 1500);

/* ================= RIGHT BAR: WATCHLIST + ALERTS placement ================= */
const ALERTS_BTN_ID = "btn-alerts";

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
  const pA2 = document.getElementById("panel-alerts-zone2");
  const zone2Placeholder = document.getElementById("zone2-placeholder");

  // Hide watchlist (zone1) only if alerts should show in zone1
  if (alertsPlacement === "zone1") {
    pWatch?.classList.add("panel-hidden");
    pA1?.classList.remove("panel-hidden");
    pA2?.classList.add("panel-hidden");
    if (zone2Placeholder) zone2Placeholder.classList.remove("panel-hidden");
    renderAlerts("zone1");
    setAlertsTab("zone1", "alerts");
  } else {
    // alerts in zone2
    pWatch?.classList.remove("panel-hidden"); // keep watchlist visible
    pA1?.classList.add("panel-hidden");
    if (zone2Placeholder) zone2Placeholder.classList.add("panel-hidden");
    pA2?.classList.remove("panel-hidden");
    renderAlerts("zone2");
    setAlertsTab("zone2", "alerts");
  }
}

function showWatchlistPanel() {
  const pWatch = document.getElementById("panel-watchlist");
  const pA1 = document.getElementById("panel-alerts-zone1");
  const pA2 = document.getElementById("panel-alerts-zone2");
  const zone2Placeholder = document.getElementById("zone2-placeholder");

  pWatch?.classList.remove("panel-hidden");
  pA1?.classList.add("panel-hidden");

  // IMPORTANT:
  // Watchlist lives in Zone 1 only.
  // If Alerts are placed in Zone 2, clicking Watchlist must NOT close Zone 2.
  if (alertsPlacement !== "zone2") {
    pA2?.classList.add("panel-hidden");
    if (zone2Placeholder) zone2Placeholder.classList.remove("panel-hidden");
  }
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
  saveWatchlists();
  mountAlertsButton();
  // keep UI consistent
  showWatchlistPanel();
  closePanelSettings();
});

/* ================= HELPERS ================= */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ================= INIT ================= */
initUserMenu();
normalizeWatchlists();
renderWatchlistHeader();
renderWatchlistTable();

mountAlertsButton();
showWatchlistPanel();

/* ================= CHART SETTINGS (TradingView-like) ================= */
const CS_KEY = "tp_chart_settings_v1";

const csDefaults = {
  prevclose: false,
  bodyOn: true,
  bodyUp: "#22c55e",
  bodyDown: "#ef4444",
  bordersOn: true,
  bordersUp: "#22c55e",
  bordersDown: "#ef4444",
  wickOn: true,
  wickUp: "#22c55e",
  wickDown: "#ef4444",
  dividends: true,
  precision: "default",
  timezone: "exchange",

  logo: true,
  title: true,
  titleMode: "description",
  chartValues: true,
  barChange: true,
  statusVolume: false,
  lastday: false,
  indTitles: true,
  indInputs: true,
  indValues: true,
  indBg: true,
  indBgAlpha: 35,

  currency: "always",
  scaleModes: "hover",
  lockRatio: false,
  scalesPlacement: "auto",
  noOverlap: true,
  plusBtn: true,
  countdown: true,
  dow: true,
  datefmt: "mon_dd_yy",
  timefmt: "24",
  saveLeftEdge: false,

  bgMode: "solid",
  bgColor: "#000000",
  grid: "both",
  separators: true,
  crosshair: "default",
  watermark: "replay",
  nav: "hover",
  pane: "hover",
  mt: 10,
  mb: 8,

  buysell: true,
  oneclick: false,
  sound: true,
  volume: 60,
  soundType: "Alarm Clock",
  rejectonly: true,
  posorders: true,
  reverse: true,
  project: false,
  pl: true,
  exmarks: true,
  exlabels: false,
  extendedlines: true,
  screenshots: false,

  alertLines: true,
  alertColor: "#ef4444",
  onlyActiveAlerts: true,
  alertVolumeOn: true,
  alertVolume: 70,
  autohideToasts: true,

  evIdeas: false,
  evDividends: true,
  evSplits: true,
  evEarnings: true,
  evEarningsBreaks: false,
  evNews: false,
  evNewsNotif: false,
};

let chartSettings = LS.get(CS_KEY, csDefaults);

function saveChartSettings() {
  LS.set(CS_KEY, chartSettings);
}

function qs(id) { return document.getElementById(id); }

const csOverlay = qs("chart-settings-overlay");
const btnChartSettings = qs("btn-chart-settings");
const btnCsClose = qs("chart-settings-close");
const btnCsCancel = qs("chart-settings-cancel");
const btnCsOk = qs("chart-settings-ok");

function openChartSettings() {
  if (!csOverlay) return;
  hydrateChartSettingsUI();
  csOverlay.classList.add("open");
  document.body.classList.add("modal-open"); // ✅ ajoute ça
}

function closeChartSettings() {
  csOverlay?.classList.remove("open");
  document.body.classList.remove("modal-open"); // ✅ ajoute ça
}

btnChartSettings?.addEventListener("click", openChartSettings);
btnCsClose?.addEventListener("click", closeChartSettings);
btnCsCancel?.addEventListener("click", closeChartSettings);

csOverlay?.addEventListener("click", (e) => {
  if (e.target === csOverlay) closeChartSettings();
});

function bindTvTabs() {
  document.querySelectorAll(".tv-nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tvtab;
      document.querySelectorAll(".tv-nav-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".tv-tab").forEach(t => t.classList.remove("active"));
      document.querySelector(`.tv-tab[data-tvtab="${tab}"]`)?.classList.add("active");
    });
  });
}
bindTvTabs();

function hydrateChartSettingsUI() {
  // Symbol
  qs("cs-prevclose").checked = !!chartSettings.prevclose;

  qs("cs-body-on").checked = !!chartSettings.bodyOn;
  qs("cs-body-up").value = chartSettings.bodyUp;
  qs("cs-body-down").value = chartSettings.bodyDown;

  qs("cs-borders-on").checked = !!chartSettings.bordersOn;
  qs("cs-borders-up").value = chartSettings.bordersUp;
  qs("cs-borders-down").value = chartSettings.bordersDown;

  qs("cs-wick-on").checked = !!chartSettings.wickOn;
  qs("cs-wick-up").value = chartSettings.wickUp;
  qs("cs-wick-down").value = chartSettings.wickDown;

  qs("cs-dividends").checked = !!chartSettings.dividends;
  qs("cs-precision").value = chartSettings.precision;
  qs("cs-timezone").value = chartSettings.timezone;

  // Status line
  qs("cs-logo").checked = !!chartSettings.logo;
  qs("cs-title").checked = !!chartSettings.title;
  qs("cs-title-mode").value = chartSettings.titleMode;
  qs("cs-chart-values").checked = !!chartSettings.chartValues;
  qs("cs-bar-change").checked = !!chartSettings.barChange;
  qs("cs-status-volume").checked = !!chartSettings.statusVolume;
  qs("cs-lastday").checked = !!chartSettings.lastday;

  qs("cs-ind-titles").checked = !!chartSettings.indTitles;
  qs("cs-ind-inputs").checked = !!chartSettings.indInputs;
  qs("cs-ind-values").checked = !!chartSettings.indValues;
  qs("cs-ind-bg").checked = !!chartSettings.indBg;
  qs("cs-ind-bg-alpha").value = chartSettings.indBgAlpha;

  // Scales
  qs("cs-currency").value = chartSettings.currency;
  qs("cs-scale-modes").value = chartSettings.scaleModes;
  qs("cs-lock-ratio").checked = !!chartSettings.lockRatio;
  qs("cs-scales-placement").value = chartSettings.scalesPlacement;

  qs("cs-no-overlap").checked = !!chartSettings.noOverlap;
  qs("cs-plus-btn").checked = !!chartSettings.plusBtn;
  qs("cs-countdown").checked = !!chartSettings.countdown;

  qs("cs-dow").checked = !!chartSettings.dow;
  qs("cs-datefmt").value = chartSettings.datefmt;
  qs("cs-timefmt").value = chartSettings.timefmt;
  qs("cs-save-left-edge").checked = !!chartSettings.saveLeftEdge;

  // Canvas
  qs("cs-bg-mode").value = chartSettings.bgMode;
  qs("cs-bg-color").value = chartSettings.bgColor;
  qs("cs-grid").value = chartSettings.grid;
  qs("cs-separators").checked = !!chartSettings.separators;
  qs("cs-crosshair").value = chartSettings.crosshair;
  qs("cs-watermark").value = chartSettings.watermark;
  qs("cs-nav").value = chartSettings.nav;
  qs("cs-pane").value = chartSettings.pane;
  qs("cs-mt").value = chartSettings.mt;
  qs("cs-mb").value = chartSettings.mb;

  // Trading
  qs("cs-buysell").checked = !!chartSettings.buysell;
  qs("cs-oneclick").checked = !!chartSettings.oneclick;
  qs("cs-sound").checked = !!chartSettings.sound;
  qs("cs-volume").value = chartSettings.volume;
  qs("cs-sound-type").value = chartSettings.soundType;
  qs("cs-rejectonly").checked = !!chartSettings.rejectonly;

  qs("cs-posorders").checked = !!chartSettings.posorders;
  qs("cs-reverse").checked = !!chartSettings.reverse;
  qs("cs-project").checked = !!chartSettings.project;
  qs("cs-pl").checked = !!chartSettings.pl;
  qs("cs-exmarks").checked = !!chartSettings.exmarks;
  qs("cs-exlabels").checked = !!chartSettings.exlabels;
  qs("cs-extendedlines").checked = !!chartSettings.extendedlines;
  qs("cs-screenshots").checked = !!chartSettings.screenshots;

  // Alerts
  qs("cs-alert-lines").checked = !!chartSettings.alertLines;
  qs("cs-alert-color").value = chartSettings.alertColor;
  qs("cs-only-active-alerts").checked = !!chartSettings.onlyActiveAlerts;
  qs("cs-alert-volume-on").checked = !!chartSettings.alertVolumeOn;
  qs("cs-alert-volume").value = chartSettings.alertVolume;
  qs("cs-autohide-toasts").checked = !!chartSettings.autohideToasts;

  // Events
  qs("cs-ev-ideas").checked = !!chartSettings.evIdeas;
  qs("cs-ev-dividends").checked = !!chartSettings.evDividends;
  qs("cs-ev-splits").checked = !!chartSettings.evSplits;
  qs("cs-ev-earnings").checked = !!chartSettings.evEarnings;
  qs("cs-ev-earnings-breaks").checked = !!chartSettings.evEarningsBreaks;
  qs("cs-ev-news").checked = !!chartSettings.evNews;
  qs("cs-ev-news-notif").checked = !!chartSettings.evNewsNotif;
}

function readChartSettingsUI() {
  chartSettings.prevclose = qs("cs-prevclose").checked;

  chartSettings.bodyOn = qs("cs-body-on").checked;
  chartSettings.bodyUp = qs("cs-body-up").value;
  chartSettings.bodyDown = qs("cs-body-down").value;

  chartSettings.bordersOn = qs("cs-borders-on").checked;
  chartSettings.bordersUp = qs("cs-borders-up").value;
  chartSettings.bordersDown = qs("cs-borders-down").value;

  chartSettings.wickOn = qs("cs-wick-on").checked;
  chartSettings.wickUp = qs("cs-wick-up").value;
  chartSettings.wickDown = qs("cs-wick-down").value;

  chartSettings.dividends = qs("cs-dividends").checked;
  chartSettings.precision = qs("cs-precision").value;
  chartSettings.timezone = qs("cs-timezone").value;

  chartSettings.logo = qs("cs-logo").checked;
  chartSettings.title = qs("cs-title").checked;
  chartSettings.titleMode = qs("cs-title-mode").value;
  chartSettings.chartValues = qs("cs-chart-values").checked;
  chartSettings.barChange = qs("cs-bar-change").checked;
  chartSettings.statusVolume = qs("cs-status-volume").checked;
  chartSettings.lastday = qs("cs-lastday").checked;

  chartSettings.indTitles = qs("cs-ind-titles").checked;
  chartSettings.indInputs = qs("cs-ind-inputs").checked;
  chartSettings.indValues = qs("cs-ind-values").checked;
  chartSettings.indBg = qs("cs-ind-bg").checked;
  chartSettings.indBgAlpha = Number(qs("cs-ind-bg-alpha").value || 35);

  chartSettings.currency = qs("cs-currency").value;
  chartSettings.scaleModes = qs("cs-scale-modes").value;
  chartSettings.lockRatio = qs("cs-lock-ratio").checked;
  chartSettings.scalesPlacement = qs("cs-scales-placement").value;

  chartSettings.noOverlap = qs("cs-no-overlap").checked;
  chartSettings.plusBtn = qs("cs-plus-btn").checked;
  chartSettings.countdown = qs("cs-countdown").checked;

  chartSettings.dow = qs("cs-dow").checked;
  chartSettings.datefmt = qs("cs-datefmt").value;
  chartSettings.timefmt = qs("cs-timefmt").value;
  chartSettings.saveLeftEdge = qs("cs-save-left-edge").checked;

  chartSettings.bgMode = qs("cs-bg-mode").value;
  chartSettings.bgColor = qs("cs-bg-color").value;
  chartSettings.grid = qs("cs-grid").value;
  chartSettings.separators = qs("cs-separators").checked;
  chartSettings.crosshair = qs("cs-crosshair").value;
  chartSettings.watermark = qs("cs-watermark").value;
  chartSettings.nav = qs("cs-nav").value;
  chartSettings.pane = qs("cs-pane").value;
  chartSettings.mt = Number(qs("cs-mt").value || 10);
  chartSettings.mb = Number(qs("cs-mb").value || 8);

  chartSettings.buysell = qs("cs-buysell").checked;
  chartSettings.oneclick = qs("cs-oneclick").checked;
  chartSettings.sound = qs("cs-sound").checked;
  chartSettings.volume = Number(qs("cs-volume").value || 60);
  chartSettings.soundType = qs("cs-sound-type").value;
  chartSettings.rejectonly = qs("cs-rejectonly").checked;

  chartSettings.posorders = qs("cs-posorders").checked;
  chartSettings.reverse = qs("cs-reverse").checked;
  chartSettings.project = qs("cs-project").checked;
  chartSettings.pl = qs("cs-pl").checked;
  chartSettings.exmarks = qs("cs-exmarks").checked;
  chartSettings.exlabels = qs("cs-exlabels").checked;
  chartSettings.extendedlines = qs("cs-extendedlines").checked;
  chartSettings.screenshots = qs("cs-screenshots").checked;

  chartSettings.alertLines = qs("cs-alert-lines").checked;
  chartSettings.alertColor = qs("cs-alert-color").value;
  chartSettings.onlyActiveAlerts = qs("cs-only-active-alerts").checked;
  chartSettings.alertVolumeOn = qs("cs-alert-volume-on").checked;
  chartSettings.alertVolume = Number(qs("cs-alert-volume").value || 70);
  chartSettings.autohideToasts = qs("cs-autohide-toasts").checked;

  chartSettings.evIdeas = qs("cs-ev-ideas").checked;
  chartSettings.evDividends = qs("cs-ev-dividends").checked;
  chartSettings.evSplits = qs("cs-ev-splits").checked;
  chartSettings.evEarnings = qs("cs-ev-earnings").checked;
  chartSettings.evEarningsBreaks = qs("cs-ev-earnings-breaks").checked;
  chartSettings.evNews = qs("cs-ev-news").checked;
  chartSettings.evNewsNotif = qs("cs-ev-news-notif").checked;
}

function applyChartSettingsToUI() {
  // Pour l’instant : on applique ce qu’on peut sans vrai chart
  // (quand on intègre le chart réel, on branchera chartSettings -> chart API)
  const chartArea = document.getElementById("chart-area");
  if (chartArea) {
    chartArea.style.background = chartSettings.bgColor || "#000";
  }
}

btnCsOk?.addEventListener("click", () => {
  readChartSettingsUI();
  saveChartSettings();
  applyChartSettingsToUI();
  closeChartSettings();
});

// applique au démarrage
applyChartSettingsToUI();

