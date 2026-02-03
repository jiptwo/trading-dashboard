console.log("MAIN.JS LOADED");

/* ===== DATA ===== */

const chartTypes = [
  { label: "Bars", icon: "bars.svg", favorite: false },
  { label: "Candles", icon: "candles.svg", favorite: true },
  { label: "Heikin Ashi", icon: "heikin.svg", favorite: true },
  { label: "Line", icon: "line.svg", favorite: false },
];

const timeframes = [
  { label: "1s", favorite: true },
  { label: "1m", favorite: true },
  { label: "5m", favorite: true },
  { label: "15m", favorite: false },
  { label: "1h", favorite: false },
  { label: "D", favorite: false },
  { label: "W", favorite: false },
];

/* ===== HELPERS ===== */

function toggleFavorite(list, label, rerender) {
  const item = list.find(i => i.label === label);
  if (item) item.favorite = !item.favorite;
  rerender();
}

/* ===== RENDER CHART TYPES ===== */

function renderChartTypes() {
  const favs = document.getElementById("chart-favorites");
  const menu = document.getElementById("chart-menu");

  favs.innerHTML = "";
  menu.innerHTML = "";

  chartTypes.forEach(ct => {
    if (ct.favorite) {
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.title = ct.label;
      btn.innerHTML = `<img src="./icons/${ct.icon}" class="icon" />`;
      favs.appendChild(btn);
    }

    const item = document.createElement("div");
    item.className = "chart-item";
    item.innerHTML = `
      <img src="./icons/${ct.icon}" class="menu-icon" />
      <span>${ct.label}</span>
      <span class="star">${ct.favorite ? "⭐" : ""}</span>
    `;
    item.onclick = () => toggleFavorite(chartTypes, ct.label, renderChartTypes);
    menu.appendChild(item);
  });
}

/* ===== RENDER TIMEFRAMES ===== */

function renderTimeframes() {
  const favs = document.getElementById("timeframe-favorites");
  const menu = document.getElementById("timeframe-menu");

  favs.innerHTML = "";
  menu.innerHTML = "";

  timeframes.forEach(tf => {
    if (tf.favorite) {
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = tf.label;
      btn.title = `Timeframe ${tf.label}`;
      favs.appendChild(btn);
    }

    const item = document.createElement("div");
    item.className = "timeframe-item";
    item.innerHTML = `
      <span>${tf.label}</span>
      <span class="star">${tf.favorite ? "⭐" : ""}</span>
    `;
    item.onclick = () => toggleFavorite(timeframes, tf.label, renderTimeframes);
    menu.appendChild(item);
  });
}

/* ===== RESIZERS ===== */

const rightBar = document.getElementById("right-bar");
const resizerV = document.getElementById("resizer-vertical");
let resizingV = false;

resizerV.addEventListener("mousedown", () => resizingV = true);
document.addEventListener("mouseup", () => resizingV = false);
document.addEventListener("mousemove", e => {
  if (!resizingV) return;
  const w = window.innerWidth - e.clientX;
  if (w > 260 && w < 520) rightBar.style.width = w + "px";
});

const zone1 = document.getElementById("zone-1");
const resizerH = document.getElementById("resizer-horizontal");
let resizingH = false;

resizerH.addEventListener("mousedown", () => resizingH = true);
document.addEventListener("mouseup", () => resizingH = false);
document.addEventListener("mousemove", e => {
  if (!resizingH) return;
  const rect = rightBar.getBoundingClientRect();
  const h = e.clientY - rect.top;
  if (h > 120 && h < rect.height - 120) zone1.style.height = h + "px";
});

/* ===== INIT ===== */

renderChartTypes();
renderTimeframes();

