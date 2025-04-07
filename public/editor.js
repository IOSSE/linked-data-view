// Warte auf das Laden der Seite

document.addEventListener("DOMContentLoaded", () => {
    const editButton = document.createElement("button");
    editButton.textContent = "Bearbeiten";
    editButton.style.marginBottom = "10px";
    editButton.style.padding = "4px 8px";
  
    const container = document.querySelector("div");
    container.insertBefore(editButton, container.firstChild);
  
    const table = document.querySelector("table");
    const literalCells = document.querySelectorAll("td.literal");
  
    // Add + Button (initially hidden)
    const addButton = document.createElement("button");
    addButton.textContent = "+";
    addButton.style.display = "none";
    addButton.style.marginTop = "10px";
    addButton.style.fontSize = "20px";
    addButton.style.padding = "2px 12px";
    addButton.style.border = "1px solid #ccc";
    addButton.style.backgroundColor = "#fff";
    addButton.style.cursor = "pointer";
  
    // Wrapper für Zentrierung des Add-Buttons
    const addWrapper = document.createElement("div");
    addWrapper.style.display = "flex";
    addWrapper.style.justifyContent = "center";
    addWrapper.style.marginTop = "10px";
    addWrapper.appendChild(addButton);
  
    // Save Button (initially hidden)
    const saveButton = document.createElement("button");
    saveButton.textContent = "Speichern";
    saveButton.style.display = "none";
    saveButton.style.marginTop = "10px";
    saveButton.style.padding = "4px 8px";
  
    // Buttons platzieren
    table.parentNode.insertBefore(addWrapper, table.nextSibling);
    container.appendChild(saveButton);
  
    editButton.addEventListener("click", () => {
      literalCells.forEach((element) => {
        const value = element.textContent;
        element.innerHTML = `<input type="text" value="${value}"/>`;
      });
  
      addButton.style.display = "inline-block";
      saveButton.style.display = "inline-block";
      editButton.disabled = true;
    });
  
    addButton.addEventListener("click", () => {
      const newRow = document.createElement("tr");
      newRow.classList.add("property");
      newRow.innerHTML = `
        <td class="resource">
          <a class="resource extern" href="#">Neue Eigenschaft</a>
        </td>
        <td class="literal">
          <input type="text" value="Neuer Wert" />
        </td>
      `;
      table.appendChild(newRow);
    });
  
    saveButton.addEventListener("click", () => {
      const inputs = document.querySelectorAll("td.literal input");
      inputs.forEach(input => {
        const td = input.parentElement;
        td.textContent = input.value;
      });
  
      addButton.style.display = "none";
      saveButton.style.display = "none";
      editButton.disabled = false;
    });
  });
  