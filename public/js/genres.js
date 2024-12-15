export function setupGenreFields() {
    const container = document.getElementById("genre-container");

    // Feld hinzufügen
    const addGenreField = () => {
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
        >
          Entfernen
        </button>
      `;
        container.appendChild(newField);
    };

    // Event-Listener für "Hinzufügen"
    document.getElementById("add-genre-button")?.addEventListener(
        "click",
        addGenreField,
    );

    // Event-Listener für "Entfernen" (Event Delegation)
    container.addEventListener("click", (e) => {
        if (e.target.classList.contains("add-movie__button--remove")) {
            e.target.closest(".add-movie__input-group").remove();
        }
    });
}
