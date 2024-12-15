export function setupMenu() {
    const menuLinks = document.querySelectorAll(".dashboard__menu-link");
    const sections = document.querySelectorAll(".dashboard__section");

    if (menuLinks.length === 0 || sections.length === 0) return;

    menuLinks.forEach((link) => {
        link.addEventListener("click", () => {
            // Aktiven Link hervorheben
            document.querySelector(".dashboard__menu-link.active")?.classList
                .remove("active");
            link.classList.add("active");

            // Sektionen anzeigen/ausblenden
            const sectionId = link.getAttribute("data-section");
            sections.forEach((section) => section.classList.add("hidden"));
            document.getElementById(sectionId)?.classList.remove("hidden");
        });
    });
}
