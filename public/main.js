console.log("MAIN.JS LOADED");

/* =========================
   STATE (source of truth)
========================= */

const timeframes = [
  { label: "1s", favorite: true },
  { label: "1m", favorite: true },
  { label: "5m", favorite: true },
  { label: "15m", favorite: false },
  { label: "1h", favorite: false },
  { label: "D", favorite: false },
  { label: "W", favorite: false },
  { label: "M", favorite: false },
];

const chartTypes = [
  { label: "Candles", icon: "candles.svg", favorite: true },
  { label: "Bars", icon: "candles.svg", favorite: false },
  { label: "Heikin Ashi", icon: "heikin.svg", favorite: true },
  { label: "Line", icon: "candles.svg", favorite: false },
];

/* =========================
   RENDER FUNCTIONS
========================= */

function renderTimeframes() {
  const favs = document.getElementById("tf-favorites");
  const menu = document.getElementById("tf-menu");

  favs.innerHTML = "";
  menu.innerHTML = "";

  timeframes.forEach(tf => {
    if (tf.favorite) {
      const btn = document.createElement("button");
      btn.className = "btn fav-btn";
      btn.textContent = tf.label;
      favs.appendChild(btn);
    }

    const item = document.createElement("div");
    item.className = "item";
    item.textContent = tf.label + (tf.favorite ? " ⭐" : "");
    item.onclick = () => toggleFavorite(timeframes, tf.label, renderTimeframes);
    menu.appendChild(item);
  });
}

function renderChartTypes() {
  const favs = document.getElementById("chart-favorites");
  const menu = document.getElementById("chart-menu");

  favs.innerHTML = "";
  menu.innerHTML = "";

  chartTypes.forEach(ct => {
    if (ct.favorite) {
      const btn = document.createElement("button");
      btn.className = "btn icon-btn";
      btn.innerHTML = `<img src="./icons/${ct.icon}" title="${ct.label}" />`;
      favs.appendChild(btn);
    }

    const item = document.createElement("div");
    item.className = "item";
    item.textContent = ct.label + (ct.favorite ? " ⭐" : "");
    item.onclick = () => toggleFavorite(chartTypes, ct.label, renderChartTypes);
    menu.appendChild(item);
  });
}

/* =========================
   LOGIC
========================= */

function toggleFavorite(list, label, rerender) {
  const item = list.find(i => i.label === label);
  item.favorite = !item.favorite;
  rerender();
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  renderTimeframes();
  renderChartTypes();
});
