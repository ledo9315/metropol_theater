export function setupDateFilter() {
    const dateButtons = document.querySelectorAll(".programm__date");
    const movieLists = document.querySelectorAll(".programm__movie-list");

    // Falls diese Elemente auf einer Seite nicht vorhanden sind, einfach returnen
    if (!dateButtons.length || !movieLists.length) return;

    // Event-Listener für jeden Button hinzufügen
    dateButtons.forEach((button) => {
        button.addEventListener("click", () => {
            console.log("button", button);
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
}
