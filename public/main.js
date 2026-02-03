console.log("MAIN.JS LOADED");

/* ================= DROPDOWNS ================= */

document.addEventListener("click", e => {
  document.querySelectorAll(".dropdown-menu").forEach(m => m.classList.remove("open"));

  const btn = e.target.closest(".dropdown-btn");
  if (!btn) return;

  e.stopPropagation();
  const id = btn.dataset.dropdown;
  document.getElementById(id).classList.toggle("open");
});

/* ================= RESIZERS ================= */

const rightBar = document.getElementById("right-bar");
const resizerV = document.getElementById("resizer-vertical");
const resizerH = document.getElementById("resizer-horizontal");
const zone1 = document.getElementById("zone-1");
const zone2 = document.getElementById("zone-2");

let resizingV = false;
let resizingH = false;

/* Vertical (chart / right) */
resizerV.addEventListener("mousedown", () => resizingV = true);
document.addEventListener("mouseup", () => resizingV = false);
document.addEventListener("mousemove", e => {
  if (!resizingV) return;
  const w = window.innerWidth - e.clientX;
  if (w > 260 && w < 600) rightBar.style.width = w + "px";
});

/* Horizontal (zone 1 / zone 2) */
resizerH.addEventListener("mousedown", () => resizingH = true);
document.addEventListener("mouseup", () => resizingH = false);
document.addEventListener("mousemove", e => {
  if (!resizingH) return;

  const rect = rightBar.getBoundingClientRect();
  const y = e.clientY - rect.top;

  const min = 120;
  const max = rect.height - 120;

  if (y > min && y < max) {
    zone1.style.flex = "none";
    zone1.style.height = y + "px";
  }
});
