console.log("UI layout ready – no logic attached yet");

document.querySelectorAll("[data-tooltip]").forEach(el => {
  el.addEventListener("mouseenter", e => {
    const tip = document.createElement("div");
    tip.className = "tooltip";
    tip.innerText = el.dataset.tooltip;
    document.body.appendChild(tip);

    const rect = el.getBoundingClientRect();
    tip.style.left = rect.left + rect.width / 2 + "px";
    tip.style.top = rect.top - 30 + "px";

    el._tooltip = tip;
  });

  el.addEventListener("mouseleave", () => {
    el._tooltip?.remove();
  });
});


