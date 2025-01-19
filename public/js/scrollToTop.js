export function setupScrollToTop() {
    // Button und Scroll-Logik
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");

    window.addEventListener("scroll", () => {
        // Button anzeigen, wenn man 300px gescrollt hat
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add("show");
        } else {
            scrollToTopBtn.classList.remove("show");
        }
    });

    scrollToTopBtn.addEventListener("click", () => {
        // Scrollt sanft zum Seitenanfang
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    });
}
