console.log("MAIN.JS LOADED");

/* ================= DROPDOWNS ================= */

document.addEventListener("click", (e) => {
  document.querySelectorAll(".dropdown-menu.open").forEach(menu => {
    const btn = document.querySelector(
      `.dropdown-btn[data-dropdown="${menu.id}"]`
    );

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

    document
      .querySelectorAll(".dropdown-menu.open")
      .forEach(m => m.classList.remove("open"));

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

resizerV.addEventListener("mousedown", () => resizingV = true);
document.addEventListener("mouseup", () => resizingV = false);
document.addEventListener("mousemove", e => {
  if (!resizingV) return;
  const w = window.innerWidth - e.clientX;
  if (w > 260 && w < 600) rightBar.style.width = w + "px";
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

/* Chart menu : ICON → TEXT → STAR */
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
          // ✅ TIMEFRAME : texte seul (sans étoile)
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

/* ================= CUSTOMIZE COLUMNS ================= */

const tableToggle = document.getElementById("table-toggle");

/* Colonnes custom (Symbol EXCLU volontairement) */
const columnMap = {
  last: ".price",
  change: ".pos",
  changePct: ".change-pct",
  volume: ".volume",
  extended: ".extended",
  aiCote: ".ai-cote",
  aiProb: ".ai-prob"
};

/* ===== WATCHLIST HEADER (NOMS DES COLONNES) ===== */

function updateWatchlistHeader() {
  let header = document.getElementById("watchlist-header");

  if (!header) {
    header = document.createElement("div");
    header.id = "watchlist-header";
    header.className = "watchlist-row header";
    zone1.prepend(header);
  }

  header.innerHTML = "";

  // Symbol (toujours visible)
  const symbolCol = document.createElement("span");
  symbolCol.className = "col symbol header-col";
  symbolCol.textContent = "Symbol";
  header.appendChild(symbolCol);

  if (!tableToggle || !tableToggle.checked) return;

  const labels = {
    last: "Last",
    change: "Change",
    changePct: "Change %",
    volume: "Volume",
    extended: "Extended",
    aiCote: "Ai Cote",
    aiProb: "Ai Prob"
  };

  Object.keys(columnMap).forEach(key => {
    const cb = document.querySelector(`#columns-menu input[data-col="${key}"]`);
    if (!cb || !cb.checked) return;

    const col = document.createElement("span");
    col.className = "col header-col";
    col.textContent = labels[key];

    header.appendChild(col);
  });
}

/* Affichage colonnes */
function updateColumns() {
  Object.entries(columnMap).forEach(([key, selector]) => {
    const cb = document.querySelector(`#columns-menu input[data-col="${key}"]`);
    const visible = tableToggle && tableToggle.checked && cb && cb.checked;

    document.querySelectorAll(selector).forEach(el => {
      el.style.display = visible ? "" : "none";
      el.classList.toggle("col-active", visible);
    });
  });

  updateWatchlistHeader();
}

/* Table view */
if (tableToggle) {
  tableToggle.addEventListener("change", updateColumns);
}

/* Checkboxes colonnes */
document
  .querySelectorAll("#columns-menu input[data-col]")
  .forEach(cb => {
    cb.addEventListener("change", updateColumns);
  });

/* Init */
updateColumns();
