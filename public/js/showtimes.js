export function setupShowtimeFields() {
  const showtimeButton = document.querySelector("#showtime-button");
  const showtimesContainer = document.getElementById("showtimes-container");

  if (!showtimeButton || !showtimesContainer) return;

  const addShowtimeField = () => {
    const showtimeDiv = document.createElement("div");
    showtimeDiv.classList.add("add-movie__time");
    showtimeDiv.innerHTML = `
    <div class="add-movie__input-wrapper">
      <input type="date" name="show_date[]" class="add-movie__input" />
      <input type="time" name="show_time[]" class="add-movie__input" />
    </div>
    <div class="add-movie__select-wrapper">
      <label class="add-movie__select-label">
        OV:
        <select name="is_original_versions[]" class="add-movie__select">
          <option value="0">Nein</option>
          <option value="1">Ja</option>
        </select>
      </label>
      <label class="add-movie__select-label">
        3D:
        <select name="is_3ds[]" class="add-movie__select">
          <option value="0">Nein</option>
          <option value="1">Ja</option>
        </select>
      </label>
    </div>
    <button type="button" class="add-movie__button add-movie__button--remove">Entfernen</button>
  `;

    showtimesContainer.appendChild(showtimeDiv);
  };

  showtimeButton.addEventListener("click", addShowtimeField);
  showtimesContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-movie__button--remove")) {
      e.target.closest(".add-movie__time").remove();
    }
  });
}
