export function setupCarousel() {
    const slides = document.querySelectorAll(".highlights__slide");
    const prevButton = document.querySelector(".highlights__control--prev");
    const nextButton = document.querySelector(".highlights__control--next");

    // Prüfen, ob die benötigten Elemente vorhanden sind
    if (!slides.length || !prevButton || !nextButton) {
        return;
    }

    let currentIndex = 0;
    const intervalTime = 6000;

    const showSlide = (index) => {
        slides.forEach((slide, idx) => {
            slide.classList.remove("active");
            if (idx === index) {
                slide.classList.add("active");
            }
        });
    };

    const nextSlide = () => {
        currentIndex = (currentIndex + 1) % slides.length; // Loop zurück zum ersten Slide
        showSlide(currentIndex);
    };

    const prevSlide = () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(currentIndex);
    };

    // Event-Listener für Buttons
    nextButton.addEventListener("click", () => {
        clearInterval(autoSlide); // Stoppt das automatische Wechseln beim Klick
        nextSlide();
        autoSlide = setInterval(nextSlide, intervalTime); // Neustart des Intervalls
    });

    prevButton.addEventListener("click", () => {
        clearInterval(autoSlide);
        prevSlide();
        autoSlide = setInterval(nextSlide, intervalTime);
    });

    // Automatischer Wechsel
    let autoSlide = setInterval(nextSlide, intervalTime);

    // Initial Slide
    showSlide(currentIndex);
}
