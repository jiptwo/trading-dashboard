console.log("MAIN.JS LOADED");

/* ================= DATA ================= */

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
];

/* ================= FAVORITES ================= */

function toggleFavorite(list, label, render) {
  const item = list.find(i => i.label === label);
  if (item) item.favorite = !item.favorite;
  render();
}

/* ================= RENDER ================= */

function renderChartTypes() {
  const favs = document.getElementById("chart-favorites");
  const menu = document.getElementById("chart-menu");

  favs.innerHTML = "";
  menu.innerHTML = "";

  chartTypes.forEach(ct => {
    if (ct.favorite) {
      const b = document.createElement("button");
      b.className = "btn";
      b.innerHTML = `<img src="./icons/${ct.icon}" class="icon">`;
      favs.appendChild(b);
    }

    const item = document.createElement("div");
    item.className = "chart-item";
    item.innerHTML = `
      <img src="./icons/${ct.icon}" class="menu-icon">
      <span>${ct.label}</span>
      <span class="star">${ct.favorite ? "⭐" : ""}</span>
    `;
    item.onclick = () => toggleFavorite(chartTypes, ct.label, renderChartTypes);
    menu.appendChild(item);
  });
}

function renderTimeframes() {
  const favs = document.getElementById("timeframe-favorites");
  const menu = document.getElementById("timeframe-menu");

  favs.innerHTML = "";
  menu.innerHTML = "";

  timeframes.forEach(tf => {
    if (tf.favorite) {
      const b = document.createElement("button");
      b.className = "btn";
      b.textContent = tf.label;
      favs.appendChild(b);
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

/* ================= DROPDOWNS ================= */

document.addEventListener("click", e => {
  document.querySelectorAll(".dropdown-menu").forEach(m => m.classList.remove("open"));

  const btn = e.target.closest(".dropdown-btn");
  if (!btn) return;

  e.stopPropagation();
  const id = btn.dataset.dropdown;
  document.getElementById(id).classList.toggle("open");
});

/* ================= RESIZERS ================= */

const rightBar = document.getElementById("right-bar");
const vertical = document.getElementById("resizer-vertical");

let resizing = false;

vertical.addEventListener("mousedown", () => resizing = true);
document.addEventListener("mouseup", () => resizing = false);
document.addEventListener("mousemove", e => {
  if (!resizing) return;
  const w = window.innerWidth - e.clientX;
  if (w > 260 && w < 600) rightBar.style.width = w + "px";
});

/* ================= INIT ================= */

renderChartTypes();
renderTimeframes();
