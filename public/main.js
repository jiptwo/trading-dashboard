window.addEventListener("load", () => {
  const container = document.getElementById("chart");

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

    timeScale: {
      timeVisible: true,
      secondsVisible: false,
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
    { time: "2024-01-01", open: 100, high: 105, low: 95, close: 102 },
    { time: "2024-01-02", open: 102, high: 110, low: 101, close: 108 },
    { time: "2024-01-03", open: 108, high: 112, low: 104, close: 106 },
  ]);

  window.addEventListener("resize", () => {
    chart.resize(window.innerWidth, window.innerHeight);
  });
});
