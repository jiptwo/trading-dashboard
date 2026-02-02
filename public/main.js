function setupFavorites(dropdownId, favoritesId, defaultValues = []) {
  const dropdown = document.getElementById(dropdownId);
  const favoritesContainer = document.getElementById(favoritesId);
  const items = dropdown.querySelectorAll(".dropdown-item");

  let favorites = [...defaultValues];

  function render() {
    favoritesContainer.innerHTML = "";
    favorites.forEach(v => {
      const span = document.createElement("span");
      span.textContent = v;
      favoritesContainer.appendChild(span);
    });
  }

  items.forEach(item => {
    const value = item.dataset.value;

    item.addEventListener("click", e => {
      e.stopPropagation();

      if (favorites.includes(value)) {
        favorites = favorites.filter(v => v !== value);
      } else {
        favorites.push(value);
      }

      render();
    });
  });

  render();
}

// Defaults
setupFavorites("timeframe", "timeframeFavorites", ["5m"]);
setupFavorites("chartType", "chartTypeFavorites", ["candles"]);

