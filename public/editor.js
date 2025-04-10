document.addEventListener("DOMContentLoaded", () => {
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
      let predicate = element.previousElementSibling;
      

      // Wenn das Prädikat geschützt ist, dann mache es nicht bearbeitbar
      if (config.protectedPredicates.includes(predicate.textContent)) {
        console.log(predicate.textContent);
      } else {
        element.innerHTML = `<input type="text" value="${value}"/>`;
        }
    });
    
    editButton.disabled = true;
  });
});
