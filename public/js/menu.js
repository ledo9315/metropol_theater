export function setupMenu() {
    const menuLinks = document.querySelectorAll(".dashboard__menu-link");
    const sections = document.querySelectorAll(".dashboard__section");

    if (menuLinks.length === 0 || sections.length === 0) return;

    const showSection = (sectionId) => {
        sections.forEach((section) => {
            const isTargetSection = section.id === sectionId;
            section.classList.toggle("hidden", !isTargetSection);
        });

        menuLinks.forEach((link) => {
            const isActive = link.getAttribute("data-section") === sectionId;
            link.classList.toggle("active", isActive);
        });
    };

    menuLinks.forEach((link) => {
        link.addEventListener("click", () => {
            const sectionId = link.getAttribute("data-section");
            showSection(sectionId);
        });
    });

    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get("section");

    if (section) {
        showSection(section);
    } else {
        showSection("movies-section");
    }
}
