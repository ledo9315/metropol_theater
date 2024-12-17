export const setupHamburgerMenu = () => {
    const hamburger = document.querySelector(".header__hamburger");
    const nav = document.querySelector(".header__nav");

    if (!hamburger || !nav) return; // Elemente nicht vorhanden, Funktion beenden

    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("open");
        nav.classList.toggle("header__nav--active");
    });
};
