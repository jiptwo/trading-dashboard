const chart = LightweightCharts.createChart(
  document.getElementById("chart"),
  {
    layout: {
      background: { color: "#0e1117" },
      textColor: "#d1d4dc",
    },
    grid: {
      vertLines: { color: "#1f2933" },
      horzLines: { color: "#1f2933" },
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: false,
    },
  }
);

const series = chart.addSeries(LightweightCharts.CandlestickSeries);

series.setData([
  { time: "2024-01-01", open: 100, high: 105, low: 95, close: 102 },
  { time: "2024-01-02", open: 102, high: 110, low: 101, close: 108 },
  { time: "2024-01-03", open: 108, high: 112, low: 104, close: 106 },
]);
