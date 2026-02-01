console.log("MAIN.JS LOADED");

const container = document.getElementById("chart");

const chart = LightweightCharts.createChart(container, {
  width: window.innerWidth,
  height: window.innerHeight,

  layout: {
    background: { color: "#000000" },
    textColor: "#ffffff",
  },

  grid: {
    vertLines: { color: "#222" },
    horzLines: { color: "#222" },
  },

  rightPriceScale: {
    borderColor: "#444",
  },

  timeScale: {
    borderColor: "#444",
    timeVisible: true,
  },
});

const series = chart.addCandlestickSeries({
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

window.addEventListener("resize", () => {
  chart.resize(window.innerWidth, window.innerHeight);
});
