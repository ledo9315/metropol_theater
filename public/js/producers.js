export function setupProducerFields() {
  const container = document.getElementById("producer-container");
  if (!container) return;

  // Produzent hinzufügen
  const addProducerField = () => {
    const newField = document.createElement("div");
    newField.className = "add-movie__input-group";
    newField.innerHTML = `
        <input
          type="text"
          name="producers"
          class="add-movie__input"
          
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
  document.getElementById("add-producer-button")?.addEventListener(
    "click",
    addProducerField,
  );

  // Event-Listener für "Entfernen"
  container.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-movie__button--remove")) {
      e.target.closest(".add-movie__input-group").remove();
    }
  });
}
