console.log("MAIN.JS LOADED");

const container = document.getElementById("chart");
const toggleBtn = document.getElementById("themeToggle");
const body = document.body;

/* CREATE CHART */
let chart = LightweightCharts.createChart(container, getChartOptions());
let series = chart.addCandlestickSeries(getSeriesOptions());

series.setData([
  { time: "2024-01-01", open: 100, high: 110, low: 95, close: 105 },
  { time: "2024-01-02", open: 105, high: 115, low: 100, close: 110 },
  { time: "2024-01-03", open: 110, high: 120, low: 105, close: 108 },
]);

/* THEME TOGGLE */
toggleBtn.addEventListener("click", () => {
  body.classList.toggle("dark");
  body.classList.toggle("light");

  toggleBtn.textContent = body.classList.contains("dark") ? "Light" : "Dark";

  chart.applyOptions(getChartOptions());
  series.applyOptions(getSeriesOptions());
});

/* FUNCTIONS */
function getChartOptions() {
  const isDark = body.classList.contains("dark");

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    layout: {
      background: { color: isDark ? "#0b0e11" : "#ffffff" },
      textColor: isDark ? "#d1d4dc" : "#111111",
    },
    grid: {
      vertLines: { color: isDark ? "rgba(42,46,57,0.6)" : "rgba(200,200,200,0.8)" },
      horzLines: { color: isDark ? "rgba(42,46,57,0.6)" : "rgba(200,200,200,0.8)" },
    },
    timeScale: { timeVisible: true },
  };
}

function getSeriesOptions() {
  return {
    upColor: "#26a69a",
    downColor: "#ef5350",
    wickUpColor: "#26a69a",
    wickDownColor: "#ef5350",
    borderVisible: false,
  };
}

/* RESIZE */
window.addEventListener("resize", () => {
  chart.resize(window.innerWidth, window.innerHeight);
});

