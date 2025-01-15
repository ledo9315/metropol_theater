export const setupToast = () => {
    const params = new URLSearchParams(window.location.search);
    const message = params.get("message");

    if (message) {
        const decodedMessage = decodeURIComponent(message);
        showToast(decodedMessage);
    }

    function showToast(message) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("hide"); // Animation zum Ausblenden
            toast.addEventListener("animationend", () => toast.remove());
        }, 3000);
    }
};
