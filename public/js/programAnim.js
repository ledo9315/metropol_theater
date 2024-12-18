export function setupProgramAnimation() {
    const dateButtons = document.querySelectorAll("[data-date]"); // Buttons für Tage
    const movieLists = document.querySelectorAll(".programm__movie-list"); // Film-Container

    dateButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const selectedDate = button.getAttribute("data-date");

            // Alle Film-Container verstecken und Animation entfernen
            movieLists.forEach((list) => {
                if (list.getAttribute("data-date") === selectedDate) {
                    list.classList.remove("hidden");

                    // Animation auf alle Artikel anwenden
                    const movies = list.querySelectorAll(".programm__movie");
                    movies.forEach((movie) => {
                        movie.classList.remove("fadeInLeftBig"); // Animation entfernen
                        void movie.offsetWidth; // Trigger Reflow, damit die Animation erneut abgespielt wird
                        movie.classList.add("fadeInLeftBig"); // Animation hinzufügen
                    });
                } else {
                    list.classList.add("hidden");
                }
            });
        });
    });
}
