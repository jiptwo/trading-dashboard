console.log("MAIN.JS LOADED");

const container = document.getElementById("chart");

// Création du chart
const chart = LightweightCharts.createChart(container, {
  width: window.innerWidth,
  height: window.innerHeight,

  layout: {
    background: { color: "#0b0e11" },
    textColor: "#d1d4dc",
  },

  grid: {
    vertLines: { color: "rgba(42, 46, 57, 0.6)" },
    horzLines: { color: "rgba(42, 46, 57, 0.6)" },
  },

  rightPriceScale: {
    borderColor: "#2a2e39",
  },

  timeScale: {
    borderColor: "#2a2e39",
    timeVisible: true,
  },
});

// ✅ NOUVELLE API (IMPORTANT)
const series = chart.addSeries(LightweightCharts.CandlestickSeries, {
  upColor: "#26a69a",
  downColor: "#ef5350",
  borderUpColor: "#26a69a",
  borderDownColor: "#ef5350",
  wickUpColor: "#26a69a",
  wickDownColor: "#ef5350",
});

// Données test
series.setData([
  { time: "2024-01-01", open: 100, high: 110, low: 95, close: 105 },
  { time: "2024-01-02", open: 105, high: 115, low: 100, close: 110 },
  { time: "2024-01-03", open: 110, high: 120, low: 105, close: 108 },
]);

// Resize auto
window.addEventListener("resize", () => {
  chart.resize(window.innerWidth, window.innerHeight);
});
