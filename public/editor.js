//editor.js

document.addEventListener("DOMContentLoaded", () => {
  // Der config-Teil wird in dieser Datei bereits durch die Auslagerung in config.js verfügbar sein.
  // Wir gehen davon aus, dass config.js bereits vorher eingebunden wurde.

  // Bearbeiten-Button erstellen
  const editButton = document.createElement("button");
  editButton.textContent = "Bearbeiten";
  editButton.className = "edit_button";

  // Container auf der Seite finden
  const container = document.querySelector("div");
  container.insertBefore(editButton, container.firstChild);

  // Event Listener für den Bearbeiten-Button
  editButton.addEventListener("click", () => {
    const literalCells = document.querySelectorAll("td.literal");
    literalCells.forEach((element) => {
      const value = element.textContent;
      const predicate = element.getAttribute("data-predicate");

      // Wenn das Prädikat geschützt ist, dann mache es nicht bearbeitbar
      if (config.protectedPredicates.includes(predicate)) {
        element.innerHTML = `<span class="protected">${value}</span>`;
        element.setAttribute("contenteditable", "false");
      } else {
        element.innerHTML = `<input type="text" value="${value}"/>`;
        }
    });
    editButton.disabled = true;
  });
});
