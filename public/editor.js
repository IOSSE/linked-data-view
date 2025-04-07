// editor.js

// Warte bis die Seite vollständig geladen ist
document.addEventListener("DOMContentLoaded", () => {
    const editButton = document.createElement("button");
    editButton.innerHTML = '<span style="margin-right:4px">✏️</span>Edit';
    editButton.id = "editBtn";
    editButton.style.margin = "10px";

    const firstDiv = document.querySelector("div");
    if (firstDiv) {
        firstDiv.appendChild(editButton);
    }

    // Add button (+) unter die letzte Zeile
    const addRowButton = document.createElement("button");
    addRowButton.innerHTML = '<span style="margin-right:4px">➕</span>Add Row';
    addRowButton.id = "addRowBtn";
    addRowButton.style.marginTop = "20px";
    addRowButton.style.display = "none"; // nur bei Edit sichtbar

    // Save button (💾)
    const saveButton = document.createElement("button");
    saveButton.innerHTML = '<span style="margin-right:4px">💾</span>Save';
    saveButton.id = "saveBtn";
    saveButton.style.marginLeft = "10px";
    saveButton.style.display = "none";

    const table = document.querySelector("table");
    if (table && table.parentNode) {
        table.parentNode.appendChild(addRowButton);
        table.parentNode.appendChild(saveButton);
    }

    // Literal-Zellen rot umrahmen (sichtbar ab Start)
    const literalCells = document.querySelectorAll("td.literal");
    literalCells.forEach((cell) => {
        cell.style.border = "2px solid red";
    });

    // Editiermodus aktivieren
    editButton.addEventListener("click", () => {
        literalCells.forEach((cell) => {
            const value = cell.textContent;
            cell.innerHTML = `<input value="${value}" />`;
        });
        addRowButton.style.display = "inline-block";
        saveButton.style.display = "inline-block";
    });

    // Zeile hinzufügen
    addRowButton.addEventListener("click", () => {
        const newRow = document.createElement("tr");
        newRow.classList.add("property");

        const newKey = document.createElement("td");
        newKey.innerHTML = '<a href="#" class="resource">→ new:property</a>';

        const newValue = document.createElement("td");
        newValue.classList.add("literal");
        newValue.innerHTML = '<input value="" />';

        newRow.appendChild(newKey);
        newRow.appendChild(newValue);

        const tableBody = document.querySelector("table tbody") || document.querySelector("table");
        tableBody.appendChild(newRow);
    });

    // Speichern-Funktion (hier nur Demo – echte Speicherung muss ergänzt werden)
    saveButton.addEventListener("click", () => {
        const editedData = [];
        const rows = document.querySelectorAll("tr.property");

        rows.forEach(row => {
            const key = row.querySelector("td:first-child a");
            const input = row.querySelector("td.literal input");
            if (key && input) {
                editedData.push({
                    property: key.getAttribute("href"),
                    value: input.value
                });
            }
        });

        console.log("Edited data:", editedData);
        alert("Changes saved (see console log)");
    });
});