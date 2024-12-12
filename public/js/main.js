document.addEventListener("DOMContentLoaded", () => {
  const showtimeButton = document.querySelector("#showtime-button");
  const showtimesContainer = document.getElementById("showtimes-container");

  const addShowtimeField = () => {
    const showtimeDiv = document.createElement("div");
    showtimeDiv.classList.add("add-movie__time");

    showtimeDiv.innerHTML = `
            <div class="add-movie__input-wrapper">
              <input type="date" name="show_date[]" class="add-movie__input" required />
              <input type="time" name="show_time[]" class="add-movie__input" required />
            </div>
            <div class="add-movie__select-wrapper">
              <label class="add-movie__select-label">
                OV:
                <select name="is_original_version[]" class="add-movie__select">
                  <option value="0">Nein</option>
                  <option value="1">Ja</option>
                </select>
              </label>
              <label class="add-movie__select-label">
                3D:
                <select name="is_3d[]" class="add-movie__select">
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

  // Entfernen von dynamischen Feldern
  showtimesContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-movie__button--remove")) {
      e.target.closest(".add-movie__time").remove();
    }
  });
});

function addGenreField() {
  const container = document.getElementById("genre-container");

  // Erstelle ein neues Eingabefeld
  const newField = document.createElement("div");
  newField.className = "add-movie__input-group";
  newField.innerHTML = `
    <input
      type="text"
      name="genres"
      class="add-movie__input"
      required
    />
    <button
      type="button"
      class="add-movie__button add-movie__button--remove"
      onclick="removeGenreField(this)"
    >
      Entfernen
    </button>
  `;

  container.appendChild(newField);
}

function removeGenreField(button) {
  const field = button.parentElement;
  field.remove();
}

// JavaScript für das Hamburger-Menü
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".header__hamburger");
  const nav = document.querySelector(".header__nav");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    nav.classList.toggle("header__nav--active");
  });
});

// Scrollen des Programms
const scrollContainer = document.querySelector(".programm__dates");

let isDown = false;
let startX;
let scrollLeft;

scrollContainer.addEventListener("mousedown", (e) => {
  isDown = true;
  scrollContainer.classList.add("active");
  startX = e.pageX - scrollContainer.offsetLeft;
  scrollLeft = scrollContainer.scrollLeft;
});

scrollContainer.addEventListener("mouseleave", () => {
  isDown = false;
  scrollContainer.classList.remove("active");
});

scrollContainer.addEventListener("mouseup", () => {
  isDown = false;
  scrollContainer.classList.remove("active");
});

scrollContainer.addEventListener("mousemove", (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - scrollContainer.offsetLeft;
  const walk = (x - startX) * 2; // Geschwindigkeit des Scrollens anpassen
  scrollContainer.scrollLeft = scrollLeft - walk;
});

// Für Touch-Geräte
scrollContainer.addEventListener("touchstart", (e) => {
  startX = e.touches[0].pageX - scrollContainer.offsetLeft;
  scrollLeft = scrollContainer.scrollLeft;
});

scrollContainer.addEventListener("touchmove", (e) => {
  const x = e.touches[0].pageX - scrollContainer.offsetLeft;
  const walk = (x - startX) * 2;
  scrollContainer.scrollLeft = scrollLeft - walk;
});

// ---------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const dateButtons = document.querySelectorAll(".programm__date");
  const movieLists = document.querySelectorAll(".programm__movie-list");

  // Event-Listener für jeden Button hinzufügen
  dateButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Aktiven Button hervorheben
      document.querySelector(".programm__date--active")?.classList.remove(
        "programm__date--active",
      );
      button.classList.add("programm__date--active");

      // Datum des Buttons holen
      const selectedDate = button.getAttribute("data-date");

      // Alle Filmlisten durchgehen und nur die passende anzeigen
      movieLists.forEach((list) => {
        if (list.getAttribute("data-date") === selectedDate) {
          list.classList.remove("hidden");
        } else {
          list.classList.add("hidden");
        }
      });
    });
  });
});
