document.addEventListener("DOMContentLoaded", () => {
  // Bearbeiten-Button erstellen
  const editButton = document.createElement("button");
  editButton.textContent = "Bearbeiten";
  editButton.className = "edit_button visible";

  // Speichern-Button erstellen
  const saveButton = document.createElement("button");
  saveButton.textContent = "Speichern";
  saveButton.className = "save_button hidden";
  
  // Plus-Button erstellen
  const plusButton = document.createElement("button");
  plusButton.textContent = "+";
  plusButton.className = "plus-button hidden"; 

  // Minus-Button erstellen
  const minusButton = document.createElement("button");
  minusButton.textContent = "−";
  minusButton.className = "minus-button";

  // Button einfügen
  const container = document.querySelector("div");
  container.insertBefore(saveButton, container.firstChild);
  container.insertBefore(editButton, container.firstChild);

  const table = document.querySelector("table");
  table.insertAdjacentElement("afterend", plusButton);

  
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
  
  // Minus-Button zu bestehenden bearbeitbaren Zeilen hinzufügen
  const rows = document.querySelectorAll("tr");
  rows.forEach((row) => {
    const predicate = row.children[0]?.textContent?.trim();
    const isProtected = config.protectedPredicates.includes(predicate);
    const isEditable = row.children[1]?.classList.contains("literal");
    const isCustom = row.classList.contains("custom");

    // Nur Zeilen mit editierbarem Literal und nicht geschützt
    if (isEditable && !isProtected || isCustom) {
      // Falls noch kein Minus-Button vorhanden ist
      if (!row.querySelector(".minus-button")) {
        const minusButtonCell = document.createElement("td");
        const minusButton = document.createElement("button");
        minusButton.textContent = "−";
        minusButton.className = "minus-button";
        minusButton.addEventListener("click", () => {
          row.remove();
        });
        minusButtonCell.appendChild(minusButton);
        row.appendChild(minusButtonCell);
      }
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
  plusButton.classList.replace("hidden", "visible");
  saveButton.classList.replace("hidden", "visible");
  

  });
 // SPEICHERN klicken
 saveButton.addEventListener("click", () => {
  const inputs = document.querySelectorAll("td.literal input");
  inputs.forEach((input) => {
    const cell = input.parentElement;
    cell.textContent = input.value;
  });

   // Auswahl durch Text ersetzen
   const selects = document.querySelectorAll("td select");
   selects.forEach((select) => {
     const selectedValue = select.value;
     const cell = select.parentElement;
     cell.textContent = selectedValue;
   });

  // Alle Minus-Buttons entfernen
  document.querySelectorAll(".minus-button").forEach(btn => {
    btn.parentElement.remove();
  });
  
  // Buttons tauschen
  saveButton.classList.replace("visible", "hidden");
  plusButton.classList.replace("visible", "hidden");
  editButton.classList.replace("hidden", "visible");
  
 });

 
  // Neue Zeile hinzufügen
  plusButton.addEventListener("click", () => {
    const newRow = document.createElement("tr");
    newRow.classList.add("property", "custom");
  
    const propertyCell = document.createElement("td");
    const select = document.createElement("select");
  
    config.properties.forEach((prop) => {
      const option = document.createElement("option");
      option.value = prop;
      option.textContent = prop;
      select.appendChild(option);
    });
  
    propertyCell.appendChild(select);
  
    const valueCell = document.createElement("td");
    valueCell.className = "literal";
    const input = document.createElement("input");
    input.type = "text";
    valueCell.appendChild(input);
  
    newRow.appendChild(propertyCell);
    newRow.appendChild(valueCell);
    table.appendChild(newRow);

    // Neue Zeile löschen
    const minusButtonCell = document.createElement("td");
    minusButton.addEventListener("click", () => {
    newRow.remove();
    });
    minusButtonCell.appendChild(minusButton);
    newRow.appendChild(minusButtonCell);

    
  });
  
});
  
  