export function setupProgramScroll() {
    const scrollContainer = document.querySelector(".programm__dates");

    if (!scrollContainer) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    scrollContainer.addEventListener("mousedown", (e) => {
        isDown = true;
        startX = e.pageX - scrollContainer.offsetLeft;
        scrollLeft = scrollContainer.scrollLeft;
    });

    scrollContainer.addEventListener("mouseleave", () => (isDown = false));
    scrollContainer.addEventListener("mouseup", () => (isDown = false));
    scrollContainer.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        const x = e.pageX - scrollContainer.offsetLeft;
        scrollContainer.scrollLeft = scrollLeft - (x - startX) * 2;
    });
}
