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
const watchlistBody = document.querySelector(".watchlist-body");

/* Colonnes custom (Symbol exclu volontairement) */
const columnMap = {
  last: ".price",
  change: ".pos",
  changePct: ".change-pct",
  volume: ".volume",
  extended: ".extended",
  aiCote: ".ai-cote",
  aiProb: ".ai-prob"
};

const columnLabels = {
  last: "Last",
  change: "Change",
  changePct: "Change %",
  volume: "Volume",
  extended: "Extended",
  aiCote: "Ai Cote",
  aiProb: "Ai Prob"
};

/* ===== HEADER DE TABLE (DANS LA WATCHLIST) ===== */

function updateTableHeader() {
  if (!watchlistBody) return;

  let header = watchlistBody.querySelector(".watchlist-table-header");

  if (!header) {
    header = document.createElement("div");
    header.className = "watchlist-row watchlist-table-header";
    watchlistBody.prepend(header);
  }

  header.innerHTML = "";

  /* Symbol — toujours visible */
  const symbolCol = document.createElement("span");
  symbolCol.className = "symbol header-col";
  symbolCol.textContent = "Symbol";
  header.appendChild(symbolCol);

  if (!tableToggle || !tableToggle.checked) return;

  Object.keys(columnMap).forEach(key => {
    const cb = document.querySelector(`#columns-menu input[data-col="${key}"]`);
    if (!cb || !cb.checked) return;

    const col = document.createElement("span");
    col.className = "header-col";
    col.textContent = columnLabels[key];
    header.appendChild(col);
  });
}

/* Affichage colonnes */
function updateColumns() {
  Object.entries(columnMap).forEach(([key, selector]) => {
    const cb = document.querySelector(`#columns-menu input[data-col="${key}"]`);
    const visible = tableToggle && tableToggle.checked && cb && cb.checked;

    /* cellules */
    document.querySelectorAll(selector).forEach(el => {
      el.classList.toggle("col-hidden", !visible);
    });

    /* header */
    document.querySelectorAll(`.watchlist-table-header .${key}`)
      .forEach(h => h.classList.toggle("col-hidden", !visible));
  });
}

/* Events */
if (tableToggle) {
  tableToggle.addEventListener("change", updateColumns);
}

document
  .querySelectorAll("#columns-menu input[data-col]")
  .forEach(cb => cb.addEventListener("change", updateColumns));

/* Init */
updateColumns();
