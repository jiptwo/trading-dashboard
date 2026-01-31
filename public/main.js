// 1️⃣ Récupération du container
const container = document.getElementById("chart");

// 2️⃣ Création du chart
const chart = LightweightCharts.createChart(container, {
  width: container.clientWidth,
  height: container.clientHeight,

  layout: {
    background: { color: "#0b0e11" },
    textColor: "#d1d4dc",
    fontFamily: "Inter, system-ui, Arial",
  },

  grid: {
    vertLines: {
      color: "rgba(42, 46, 57, 0.6)",
    },
    horzLines: {
      color: "rgba(42, 46, 57, 0.6)",
    },
  },

  rightPriceScale: {
    borderColor: "#2a2e39",
  },

  timeScale: {
    borderColor: "#2a2e39",
    timeVisible: true,
    secondsVisible: false,
  },

  crosshair: {
    mode: LightweightCharts.CrosshairMode.Normal,
    vertLine: {
      color: "#758696",
      width: 1,
      style: LightweightCharts.LineStyle.Dashed,
    },
    horzLine: {
      color: "#758696",
      width: 1,
      style: LightweightCharts.LineStyle.Dashed,
    },
  },
});

// 3️⃣ Série chandeliers
const series = chart.addCandlestickSeries({
  upColor: "#26a69a",
  downColor: "#ef5350",
  borderUpColor: "#26a69a",
  borderDownColor: "#ef5350",
  wickUpColor: "#26a69a",
  wickDownColor: "#ef5350",
});

// 4️⃣ Données de test (temporaires)
series.setData([
  { time: "2024-01-01", open: 100, high: 105, low: 95, close: 102 },
  { time: "2024-01-02", open: 102, high: 110, low: 101, close: 108 },
  { time: "2024-01-03", open: 108, high: 112, low: 104, close: 106 },
]);

// 5️⃣ Resize auto (important pour App / futur)
window.addEventListener("resize", () => {
  chart.applyOptions({
    width: container.clientWidth,
    height: container.clientHeight,
  });
});
