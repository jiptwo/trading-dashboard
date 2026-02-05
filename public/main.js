console.log("MAIN.JS LOADED");

/* ================= DROPDOWNS ================= */

document.addEventListener("click", () => {
  document.querySelectorAll(".dropdown-menu.open")
    .forEach(m => m.classList.remove("open"));
});

document.querySelectorAll(".dropdown-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation();
    const menu = document.getElementById(btn.dataset.dropdown);
    if (menu) menu.classList.toggle("open");
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
resizerH.addEventListener("mousedown", () => resizingH = true);

document.addEventListener("mouseup", () => {
  resizingV = false;
  resizingH = false;
});

document.addEventListener("mousemove", e => {
  if (resizingV) {
    const w = window.innerWidth - e.clientX;
    if (w > 260 && w < 600) rightBar.style.width = w + "px";
  }

  if (resizingH) {
    const rect = rightBar.getBoundingClientRect();
    const y = e.clientY - rect.top;
    if (y > 120 && y < rect.height - 120) {
      zone1.style.height = y + "px";
      zone1.style.flex = "none";
    }
  }
});

/* ================= CUSTOMIZE COLUMNS ================= */

const tableToggle = document.getElementById("table-toggle");
const watchlistBody = document.querySelector(".watchlist-body");

const columnOrder = [
  "symbol",
  "last",
  "change",
  "changePct",
  "volume",
  "extended",
  "aiCote",
  "aiProb"
];

const columnLabels = {
  symbol: "Symbol",
  last: "Last",
  change: "Change",
  changePct: "Change %",
  volume: "Volume",
  extended: "Extended",
  aiCote: "Ai Cote",
  aiProb: "Ai Prob"
};

function updateTableHeader() {
  let header = watchlistBody.querySelector(".watchlist-table-header");

  if (!header) {
    header = document.createElement("div");
    header.className = "watchlist-table-header";
    watchlistBody.prepend(header);
  }

  header.innerHTML = "";

  columnOrder.forEach(key => {
    if (key !== "symbol") {
      const cb = document.querySelector(`[data-col="${key}"]`);
      if (!tableToggle.checked || !cb || !cb.checked) return;
    }

    const span = document.createElement("span");
    span.className = key === "symbol" ? "col-symbol" : `col ${key}`;
    span.textContent = columnLabels[key];
    header.appendChild(span);
  });
}

function updateColumns() {
  document.querySelectorAll(".watchlist-row").forEach(row => {
    columnOrder.forEach(key => {
      if (key === "symbol") return;

      const cb = document.querySelector(`[data-col="${key}"]`);
      const cell = row.querySelector(`.${key.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}`);

      if (cell) {
        cell.style.display =
          tableToggle.checked && cb && cb.checked ? "" : "none";
      }
    });
  });

  updateTableHeader();
}

tableToggle.addEventListener("change", updateColumns);
document.querySelectorAll("#columns-menu input[data-col]")
  .forEach(cb => cb.addEventListener("change", updateColumns));

updateColumns();

