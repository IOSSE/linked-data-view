document.addEventListener("DOMContentLoaded", () => {
  // Bearbeiten-Button erstellen
  const editButton = document.createElement("button");
  editButton.textContent = "Bearbeiten";
  editButton.className = "edit_button visible";

  // Speichern-Button erstellen
  const saveButton = document.createElement("button");
  saveButton.textContent = "Speichern";
  saveButton.className = "save_button hidden";
  
  // Button einfügen
  const container = document.querySelector("div");
  container.insertBefore(saveButton, container.firstChild);
  container.insertBefore(editButton, container.firstChild);

  
  // Button-Klick zum Editieren
  editButton.addEventListener("click", () => {
  const literalCells = document.querySelectorAll("td.literal");
  
  literalCells.forEach((element) => {
  const value = element.textContent;
  const predicate = element.previousElementSibling;
  
   if (config.protectedPredicates.includes(predicate.textContent)) {
     console.log(predicate.textContent);
   } else {
     element.innerHTML = `<input type="text" value="${value}"/>`;
     }
  });
  
  // Prüfen, ob erste Zeile rdf:type = mpbv:Pfarrer-in ist
  const ersteZeile = document.querySelectorAll("tr")[0];
  const erstesPraedikat = ersteZeile?.children[0]?.textContent.trim();
  const ersterWert = ersteZeile?.children[1]?.textContent.trim();
  
  if (erstesPraedikat === "rdf:type" && ersterWert === "mpbv:Pfarrer-in") {
  // Relevante Zellen finden
  const labelCell = [...document.querySelectorAll("td")].find(td =>
  td.previousElementSibling?.textContent.trim() === "rdfs:label"
  );
  
  const vornameInput = [...document.querySelectorAll("td")].find(td =>
  td.previousElementSibling?.textContent.trim() === "mpbv:vorname"
  )?.querySelector("input");
  
  const nachnameInput = [...document.querySelectorAll("td")].find(td =>
  td.previousElementSibling?.textContent.trim() === "mpbv:nachname"
  )?.querySelector("input");
  
  const updateLabel = () => {
    if (labelCell && vornameInput && nachnameInput) {
    const originalText = labelCell.textContent;
    const match = originalText.match(/\(.*?\)$/); // alles in () am Ende
    const rest = match ? " " + match[0] : "";
    labelCell.textContent = `${nachnameInput.value}, ${vornameInput.value}${rest}`;
    };
  };
  
  // Event Listener für Live-Update
  vornameInput?.addEventListener("input", updateLabel);
  nachnameInput?.addEventListener("input", updateLabel);
  }
  
  editButton.classList.replace("visible", "hidden");
  saveButton.classList.replace("hidden", "visible");

  });
// SPEICHERN klicken
 saveButton.addEventListener("click", () => {
  const inputs = document.querySelectorAll("td.literal input");
  inputs.forEach((input) => {
    const cell = input.parentElement;
    cell.textContent = input.value;
  });

  // Buttons tauschen: Speichern verstecken, Bearbeiten anzeigen
  saveButton.classList.replace("visible", "hidden");
  editButton.classList.replace("hidden", "visible");
 });
});
  
  
  