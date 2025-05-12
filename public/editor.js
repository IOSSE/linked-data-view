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

  // Abbrechen-Button erstellen
  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Abbrechen";
  cancelButton.className = "cancel_button hidden"; 

  // Button einfügen
  const container = document.querySelector("div");
  const table = document.querySelector("table");
  container.insertBefore(saveButton, container.firstChild);
  container.insertBefore(editButton, container.firstChild);
  container.insertBefore(cancelButton, saveButton.nextSibling);
  table.insertAdjacentElement("afterend", plusButton);

  // Wiederherstellung bei Seiten-Neuladen
  const pageKey = "rdfTable_" + window.location.pathname.split("/").pop().replace(".html", "");
const savedTable = localStorage.getItem(pageKey);
if (savedTable) {
  table.innerHTML = savedTable;
}

  
  let originalTableHTML = "";
  
  // Button-Klick zum Editieren
  editButton.addEventListener("click", () => {
    originalTableHTML = table.innerHTML;
    const literalCells = document.querySelectorAll("td.literal");

    literalCells.forEach((element) => {
      const value = element.textContent;
      const predicate = element.previousElementSibling;
      if (!config.protectedPredicates.includes(predicate.textContent)) {
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
      if ((isEditable && !isProtected) || isCustom) {
        // Falls noch kein Minus-Button vorhanden ist
        if (!row.querySelector(".minus-button")) {
          const minusButtonCell = document.createElement("td");
          const minusButton = document.createElement("button");
          minusButton.textContent = "−";
          minusButton.className = "minus-button";
          minusButton.addEventListener("click", () => row.remove());
          minusButtonCell.appendChild(minusButton);
          row.appendChild(minusButtonCell);
        }
      }
    });

    // Prüfen, ob erste Zeile rdf:type = mpbv:Pfarrer-in ist
    const ersteZeile = document.querySelectorAll("tr")[0];
    const erstesPraedikat = ersteZeile?.children[0]?.textContent.trim();
    const ersterWert = ersteZeile?.children[1]?.textContent.trim();

    // Pfarrer-in: Name im Label aktualisieren
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
          const match = originalText.match(/\(.*?\)$/);
          const rest = match ? " " + match[0] : "";
          labelCell.textContent = `${nachnameInput.value}, ${vornameInput.value}${rest}`;
        }
      };

      // Event Listener für Live-Update
      vornameInput?.addEventListener("input", updateLabel);
      nachnameInput?.addEventListener("input", updateLabel);

      // Zusatzfunktion: Nur Klammerteil bei Datum ändern
      const geburtsDatumInput = [...document.querySelectorAll("td")].find(td =>
        td.previousElementSibling?.textContent.trim() === "mpbv:datum" &&
        td.parentElement.querySelector("td")?.textContent.includes("Geburt")
      )?.querySelector("input");

      const todesDatumInput = [...document.querySelectorAll("td")].find(td =>
        td.previousElementSibling?.textContent.trim() === "mpbv:datum" &&
        td.parentElement.querySelector("td")?.textContent.includes("Tod")
      )?.querySelector("input");

      const updateKlammerTeil = () => {
        if (labelCell) {
          let originalText = labelCell.textContent;
          let klammerMatch = originalText.match(/\(.*?\)$/);
          let klammerInhalt = klammerMatch ? klammerMatch[0] : "";
          let start = klammerInhalt.match(/\*\d{4}/)?.[0]?.slice(1) ?? "";
          let ende = klammerInhalt.match(/†\d{4}/)?.[0]?.slice(1) ?? "";

          if (geburtsDatumInput?.value) start = geburtsDatumInput.value.slice(0, 4);
          if (todesDatumInput?.value) ende = todesDatumInput.value.slice(0, 4);

          const neuerKlammerTeil = `(*${start}${ende ? "–†" + ende : ""})`;
          labelCell.textContent = originalText.replace(/\(.*?\)$/, neuerKlammerTeil);
        }
      };

      geburtsDatumInput?.addEventListener("input", updateKlammerTeil);
      todesDatumInput?.addEventListener("input", updateKlammerTeil);
    }

    // mpbv:Geburt Label-Update
    if (erstesPraedikat === "rdf:type" && ersterWert === "mpbv:Geburt") {
      const labelCellGeburt = [...document.querySelectorAll("td")].find(td =>
        td.previousElementSibling?.textContent.trim() === "rdfs:label"
      );

      const datumInput = [...document.querySelectorAll("td")].find(td =>
        td.previousElementSibling?.textContent.trim() === "mpbv:datum"
      )?.querySelector("input");

      const updateGeburtsLabel = () => {
        if (labelCellGeburt && datumInput) {
          const year = datumInput.value.slice(0, 4);
          labelCellGeburt.textContent = `geboren ${year}`;
          const andereLabelZelle = [...document.querySelectorAll("td")].find(td =>
            td.textContent.includes("(*") && td.previousElementSibling?.textContent.trim() === "rdfs:label"
          );
          if (andereLabelZelle) {
            andereLabelZelle.textContent = andereLabelZelle.textContent.replace(/\(\*\d{4}/, `(*${year}`);
          }
        }
      };

      datumInput?.addEventListener("input", updateGeburtsLabel);
    }

    // mpbv:Tod Label-Update
    if (erstesPraedikat === "rdf:type" && ersterWert === "mpbv:Tod") {
      const labelCellTod = [...document.querySelectorAll("td")].find(td =>
        td.previousElementSibling?.textContent.trim() === "rdfs:label"
      );

      const datumInputTod = [...document.querySelectorAll("td")].find(td =>
        td.previousElementSibling?.textContent.trim() === "mpbv:datum"
      )?.querySelector("input");

      const updateTodesLabel = () => {
        if (labelCellTod && datumInputTod) {
          const year = datumInputTod.value.slice(0, 4);
          labelCellTod.textContent = `gestorben ${year}`;
          const andereLabelZelle = [...document.querySelectorAll("td")].find(td =>
            td.textContent.includes("†") && td.previousElementSibling?.textContent.trim() === "rdfs:label"
          );
          if (andereLabelZelle) {
            andereLabelZelle.textContent = andereLabelZelle.textContent.replace(/†\d{4}/, `†${year}`);
          }
        }
      };

      datumInputTod?.addEventListener("input", updateTodesLabel);
    }

    editButton.classList.replace("visible", "hidden");
    plusButton.classList.replace("hidden", "visible");
    saveButton.classList.replace("hidden", "visible");
    cancelButton.classList.replace("hidden", "visible");
  });

  // SPEICHERN klicken
  saveButton.addEventListener("click", () => {
    document.querySelectorAll("td.literal input").forEach(input => {
      input.parentElement.textContent = input.value;
    });

    document.querySelectorAll("td select").forEach(select => {
      const cell = select.parentElement;
      cell.textContent = select.value;
    });

    // Nach Speichern: Minus-Buttons entfernen
    document.querySelectorAll(".minus-button").forEach(btn => {
      btn.parentElement.remove();
    });

    plusButton.classList.replace("visible", "hidden");
    saveButton.classList.replace("visible", "hidden");
    cancelButton.classList.replace("visible", "hidden");
    editButton.classList.replace("hidden", "visible");
    originalTableHTML = table.innerHTML;

    // Tabelle im Browser speichern
    localStorage.setItem(pageKey, table.innerHTML);
    originalTableHTML = table.innerHTML;
     
   
  });

  // Abbrechen klicken
  cancelButton.addEventListener("click", () => {
    table.innerHTML = originalTableHTML;
    saveButton.classList.replace("visible", "hidden");
    plusButton.classList.replace("visible", "hidden");
    editButton.classList.replace("hidden", "visible");
    cancelButton.classList.replace("visible", "hidden");
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

    const minusButtonCell = document.createElement("td");
    const minusButton = document.createElement("button");
    minusButton.textContent = "−";
    minusButton.className = "minus-button";
    minusButton.addEventListener("click", () => newRow.remove());
    minusButtonCell.appendChild(minusButton);

    newRow.appendChild(propertyCell);
    newRow.appendChild(valueCell);
    newRow.appendChild(minusButtonCell);
    table.appendChild(newRow);
  });
});
