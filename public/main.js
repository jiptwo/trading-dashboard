console.log("MAIN.JS LOADED");

const chart = LightweightCharts.createChart(
  document.getElementById("chart"),
  {
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
  }
);

// ✅ NEW API (v4+)
const series = chart.addSeries(
  LightweightCharts.CandlestickSeries,
  {
    upColor: "#26a69a",
    downColor: "#ef5350",
    borderVisible: false,
    wickUpColor: "#26a69a",
    wickDownColor: "#ef5350",
  }
);

series.setData([
  { time: "2024-01-01", open: 100, high: 110, low: 95, close: 105 },
  { time: "2024-01-02", open: 105, high: 115, low: 100, close: 110 },
  { time: "2024-01-03", open: 110, high: 120, low: 105, close: 108 },
]);
