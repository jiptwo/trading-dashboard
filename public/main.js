console.log("MAIN.JS LOADED");

/* ===== RESIZE RIGHT BAR (VERS LE GRAPHIQUE) ===== */

const rightBar = document.getElementById("right-bar");
const resizerV = document.getElementById("resizer-vertical");

let resizingV = false;

resizerV.addEventListener("mousedown", () => resizingV = true);
document.addEventListener("mouseup", () => resizingV = false);

document.addEventListener("mousemove", (e) => {
  if (!resizingV) return;
  const newWidth = window.innerWidth - e.clientX;
  if (newWidth > 220 && newWidth < 500) {
    rightBar.style.width = newWidth + "px";
  }
});

/* ===== RESIZE ZONE 1 / ZONE 2 ===== */

const zone1 = document.getElementById("zone-1");
const resizerH = document.getElementById("resizer-horizontal");

let resizingH = false;

resizerH.addEventListener("mousedown", () => resizingH = true);
document.addEventListener("mouseup", () => resizingH = false);

document.addEventListener("mousemove", (e) => {
  if (!resizingH) return;
  const rect = rightBar.getBoundingClientRect();
  const newHeight = e.clientY - rect.top;
  if (newHeight > 120 && newHeight < rect.height - 120) {
    zone1.style.height = newHeight + "px";
  }
});
