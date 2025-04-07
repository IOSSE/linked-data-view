document.addEventListener("DOMContentLoaded", () => {
    // Button erstellen
    const button = document.createElement("button");
    button.textContent = "Editieren";
    button.style.margin = "10px";

    // Den Button in das erste <div>-Element einfügen
    const firstDiv = document.querySelector("div");
    if (firstDiv) {
        firstDiv.appendChild(button);
    }

    // Event-Listener für den Button
    button.addEventListener("click", () => {
        const elements = document.querySelectorAll("td.literal");
        elements.forEach((element) => {
            element.innerHTML = `<input value="${element.textContent}"/>`;
        });
    });

    // Alle TD-Elemente mit der Klasse 'literal' rot umrandet
    const elements = document.querySelectorAll("td.literal");
    elements.forEach((element) => {
        element.style.border = "2px solid red";
    });
});