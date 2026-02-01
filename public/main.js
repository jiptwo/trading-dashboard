console.log("MAIN.JS LOADED");

const container = document.getElementById("chart");
const toggleBtn = document.getElementById("themeToggle");

let chart;
let series;

const themes = {
  dark: {
    bg: "#0b0e11",
    text: "#d1d4dc",
    grid: "rgba(42, 46, 57, 0.6)",
    label: "🌙 Dark",
  },
  light: {
    bg: "#ffffff",
    text: "#111111",
    grid: "rgba(200, 200, 200, 0.6)",
    label: "☀️ Light",
  },
};

let currentTheme = localStorage.getItem("theme") || "dark";
document.body.classList.toggle("light", currentTheme === "light");

function buildChart(theme) {
  if (chart) chart.remove();

  chart = LightweightCharts.createChart(container, {
    width: window.innerWidth,
    height: window.innerHeight,
    layout: {
      background: { color: themes[theme].bg },
      textColor: themes[theme].text,
    },
    grid: {
      vertLines: { color: themes[theme].grid },
      horzLines: { color: themes[theme].grid },
    },
  });

  series = chart.addCandlestickSeries({
    upColor: "#26a69a",
    downColor: "#ef5350",
    borderUpColor: "#26a69a",
    borderDownColor: "#ef5350",
    wickUpColor: "#26a69a",
    wickDownColor: "#ef5350",
  });

  series.setData([
    { time: "2024-01-01", open: 100, high: 110, low: 95, close: 105 },
    { time: "2024-01-02", open: 105, high: 115, low: 100, close: 110 },
    { time: "2024-01-03", open: 110, high: 120, low: 105, close: 108 },
  ]);
}

buildChart(currentTheme);
toggleBtn.textContent = themes[currentTheme].label;

toggleBtn.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", currentTheme);

  document.body.classList.toggle("light", currentTheme === "light");
  toggleBtn.textContent = themes[currentTheme].label;

  buildChart(currentTheme);
});

window.addEventListener("resize", () => {
  chart.resize(window.innerWidth, window.innerHeight);
});
