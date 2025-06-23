// containts the resource uri
var resource = '';

function editResource() {
    const literalCells = document.querySelectorAll("td.literal");
    literalCells.forEach((element) => {
        const value = replaceQuotes(element.textContent);
        const predicate = element.previousElementSibling;
        element.setAttribute('save', value);

        if (!config.protectedPredicates.includes(predicate.textContent)) {
            element.innerHTML = `<input type="text" value="${value}"/>`;
        }

        // Nur im Bearbeitungsmodus Minus-Button einfügen (falls nicht vorhanden)
        const predicateText = element.previousElementSibling.textContent;

// Nur wenn Prädikat nicht geschützt und noch keine minus-cell da ist
if (
    !config.protectedPredicates.includes(predicateText) &&
    !element.parentElement.querySelector('.minus-cell')
  ) {
    const minusButton = document.createElement('button');
    minusButton.textContent = '−';
    minusButton.classList.add('minus-button');
    minusButton.addEventListener('click', () => {
      localStorage.setItem(resource + '$delete$' + predicateText, '');
      element.parentElement.remove();
    });
  
    const minusCell = document.createElement('td');
    minusCell.classList.add('minus-cell'); // ← eindeutig!
    minusCell.appendChild(minusButton);
  
    const row = element.parentElement;
    row.appendChild(minusCell); // oder:
    // row.insertBefore(minusCell, row.children[2]);
  }
  

    });

    insertPlusButtonRow();
}

function saveResource() {
    const literalCells = document.querySelectorAll("td.literal");
    literalCells.forEach((element) => {
        const inputElement = element.querySelector('input');
        let value;
        if (inputElement) {
            value = replaceQuotes(inputElement.value);
        } else {
            value = replaceQuotes(element.textContent);
        }

        const predicateCell = element.previousElementSibling;
        const pred = predicateCell.querySelector('select')?.value || predicateCell.textContent;

        if (value !== element.getAttribute('save')) {
            element.classList.add('new');
            localStorage.setItem(resource + '$' + pred, value);
        }

        // Bei neuen Zeilen ohne vorherigen "save"-Wert trotzdem speichern
        if (!element.hasAttribute('save')) {
            element.classList.add('new');
            localStorage.setItem(resource + '$' + pred, value);
        }

        // Sonderfall: mpbv:hatLebensabschnitt 
if (pred === 'mpbv:hatLebensabschnitt') {
    const a = document.createElement('a');
    a.className = 'resource intern';
    a.href = value;
    a.setAttribute('uri', value.startsWith('http') ? value : 'http://meta-pfarrerbuch.evangelische-archive.de' + value);
    a.setAttribute('rel', 'nofollow');
    a.textContent = value.split('/').pop(); // oder z. B. "geboren 1912" – wenn bekannt
    element.innerHTML = '';
    element.appendChild(a);
} else {
    element.innerHTML = value;
}

    });

    removePlusButtonRow();
    checkLabel();
    removePlusButtonRow();
    // MINUS-BUTTONS & leere Zellen entfernen
    document.querySelectorAll(".minus-button").forEach(btn => btn.remove());
    document.querySelectorAll("td.minus-cell").forEach(cell => cell.remove());
}

function cancelResource() {
    const literalCells = document.querySelectorAll("td.literal");
    literalCells.forEach((element) => {
        element.innerHTML = element.getAttribute('save');
    });

    // MINUS-BUTTONS & leere Zellen entfernen
    document.querySelectorAll(".minus-button").forEach(btn => btn.remove());
    document.querySelectorAll("td.minus-cell").forEach(cell => cell.remove());

    removePlusButtonRow();
}

function shortenUri(uri) {
    if (uri.startsWith("http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#")) {
        return "mpbv:" + uri.split("#")[1];
    }
    return uri;
}

function insertPlusButtonRow() {
    if (document.getElementById('plus-row')) return;

    const table = document.querySelector('table');
    const row = document.createElement('tr');
    row.id = 'plus-row';

    const td = document.createElement('td');
    td.colSpan = 3;
    td.classList.add('plus-button-cell');

    const plusButton = document.createElement('button');
    plusButton.textContent = '+';
    plusButton.classList.add('plus-button');
    plusButton.addEventListener("click", () => {
        const newRow = document.createElement("tr");
        newRow.classList.add("property", "custom");

        const propertyCell = document.createElement("td");
        const select = document.createElement("select");

        // rdf:type herausfinden
        const typeElement = document.querySelector('td.resource a[uri="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"]');
        let type = null;
        if (typeElement) {
            const fullTypeUri = typeElement.parentElement.nextElementSibling.textContent.trim();
            type = shortenUri(fullTypeUri);
        }

        // passende Properties laden
        let props = config.properties; // fallback default
        if (type && config.typeProperties[type]) {
            props = config.typeProperties[type];
        }

        // Select befüllen
        props.forEach((prop) => {
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

        const minusCell = document.createElement("td");
        const minusButton = document.createElement("button");
        minusButton.textContent = "−";
        minusButton.className = "minus-button";
        minusButton.addEventListener("click", () => newRow.remove());
        minusCell.appendChild(minusButton);

        newRow.appendChild(propertyCell);
        newRow.appendChild(valueCell);
        newRow.appendChild(minusCell);

        table.appendChild(newRow);
    });

    td.appendChild(plusButton);
    row.appendChild(td);
    table.appendChild(row);
}



function removePlusButtonRow() {
    const plusRow = document.getElementById('plus-row');
    if (plusRow) {
        plusRow.remove();
    }
}

function checkLabel() {
    const rdfTypeElement = document.querySelector('td.resource a[uri="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"]');

    if (rdfTypeElement) {
        const rdfTypeValue = rdfTypeElement.parentElement.nextElementSibling.textContent.trim();
        const labelConstruct = config.defineLabel[rdfTypeValue];
        if (labelConstruct) {
            let value;
            const replacedText = labelConstruct.replace(/{(.*?)}/g, (match, key) => {
                if (key.startsWith('fkt_')) {
                    if (typeof globalThis[key] === 'function') {
                        value = globalThis[key]();
                    } else {
                        console.warn(`Keine Funktion namens ${key} definiert.`);
                    }
                } else {
                    const keyValue = document.querySelector('td.resource a[uri="' + key + '"]');
                    if (keyValue) {
                        value = keyValue.parentElement.nextElementSibling.textContent.trim();
                    } else {
                        value = '';
                    }
                }
                return value !== undefined ? value : match;
            });

            const labelElementKey = document.querySelector('td.resource a[uri="http://www.w3.org/2000/01/rdf-schema#label"]');
            if (labelElementKey) {
                const labelElement = labelElementKey.parentElement.nextElementSibling;
                if (labelElement.textContent !== replacedText) {
                    labelElement.textContent = replacedText;
                    labelElement.classList.add('new');
                    document.title = replacedText;
                    document.querySelector('h1').textContent = replacedText;
                    localStorage.setItem(resource + '$rdfs:label', replacedText);
                }
            }
        }
    }
}

function loadFromStore() {
    const literalCells = document.querySelectorAll("td.literal");
    literalCells.forEach((element) => {
        const predicate = element.previousElementSibling;
        const pred = predicate.textContent;

        // Überspringe gelöschte Einträge
        if (localStorage.getItem(resource + '$delete$' + pred) !== null) {
            element.parentElement.remove();
            return;
        }

        const value = localStorage.getItem(resource + '$' + pred);
        if (value !== null) {
            // Property-Zelle 
            if (pred.includes(':')) {
                const [prefix, local] = pred.split(':');
                let base = '';
                if (prefix === 'mpbv') {
                    base = "http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#";
                }
                const uri = base + local;

                const propertyLink = document.createElement('a');
                propertyLink.className = "resource extern";
                propertyLink.href = uri;
                propertyLink.setAttribute("uri", uri);
                propertyLink.setAttribute("rel", "nofollow");
                propertyLink.setAttribute("target", "_blank");
                propertyLink.textContent = pred;

                predicate.innerHTML = '';
                predicate.appendChild(propertyLink);
            }

            // Wert-Zelle 
            if (pred === 'mpbv:hatLebensabschnitt') {
                const a = document.createElement('a');
                a.className = 'resource intern';
                const uri = value.startsWith('http') ? value : 'http://meta-pfarrerbuch.evangelische-archive.de' + value;
                a.href = uri;
                a.setAttribute('uri', uri);
                a.setAttribute('rel', 'nofollow');
                a.textContent = value.split('/').pop() || value;

                element.innerHTML = '';
                element.appendChild(a);
            } else {
                element.textContent = value;
            }

            element.classList.add('new');

            if (pred === 'rdfs:label') {
                document.title = value;
                const firstH1 = document.querySelector('h1');
                firstH1.textContent = value;
            }
        }
    });

    // Labels von verlinkten Ressourcen aktualisieren
    const resourceCells = document.querySelectorAll("a.resource.intern");
    resourceCells.forEach((element) => {
        const predicate = element.parentElement.previousElementSibling;
        const value = localStorage.getItem(element.getAttribute('uri') + '$rdfs:label');
        if (value !== null) {
            element.textContent = value;
            element.parentElement.classList.add('new');
        }
    });

    // Neue Zeilen aus dem localStorage ergänzen
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key.startsWith(resource + '$') && !key.includes('$delete$')) {
            const pred = key.split('$')[1];
            const value = localStorage.getItem(key);

            // Falls Prädikat bereits in der Tabelle, überspringen
            const exists = Array.from(document.querySelectorAll("td.literal")).some(cell => {
                const existingPred = cell.previousElementSibling.textContent;
                return existingPred === pred;
            });
            if (exists) continue;

            const table = document.querySelector('table');
            const newRow = document.createElement("tr");
            newRow.classList.add("property");

            const propertyCell = document.createElement("td");
            if (pred.includes(':')) {
                const [prefix, local] = pred.split(':');
                let base = '';
                if (prefix === 'mpbv') {
                    base = "http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#";
                }
                const uri = base + local;

                const a = document.createElement("a");
                a.className = "resource extern";
                a.href = uri;
                a.setAttribute("uri", uri);
                a.setAttribute("rel", "nofollow");
                a.setAttribute("target", "_blank");
                a.textContent = pred;
                propertyCell.appendChild(a);
            } else {
                propertyCell.textContent = pred;
            }

            const valueCell = document.createElement("td");
            valueCell.className = "literal new";

            if (pred === 'mpbv:hatLebensabschnitt') {
                const a = document.createElement('a');
                a.className = 'resource intern';
                const uri = value.startsWith('http') ? value : 'http://meta-pfarrerbuch.evangelische-archive.de' + value;
                a.href = uri;
                a.setAttribute('uri', uri);
                a.setAttribute('rel', 'nofollow');
                a.textContent = value.split('/').pop() || value;
                valueCell.appendChild(a);
            } else {
                valueCell.textContent = value;
            }

            newRow.appendChild(propertyCell);
            newRow.appendChild(valueCell);
            table.appendChild(newRow);
        }
    }

    checkLabel();
}


function removeStorage() {
    localStorage.clear();
    window.location.reload(true);
}

document.addEventListener('DOMContentLoaded', function () {
    resource = document.getElementById('resource').textContent;
    loadFromStore();

    const nav = document.createElement('nav');

    const editButton = document.createElement('button');
    editButton.id = 'editButton';
    editButton.textContent = 'Bearbeiten';

    const saveButton = document.createElement('button');
    saveButton.id = 'saveButton';
    saveButton.textContent = 'Speichern';
    saveButton.disabled = true;

    const cancelButton = document.createElement('button');
    cancelButton.id = 'cancelButton';
    cancelButton.textContent = 'Abbrechen';
    cancelButton.disabled = true;

    const removeButton = document.createElement('button');
    removeButton.id = 'removeButton';
    removeButton.textContent = 'Änderungen verwerfen';
    removeButton.disabled = true;

    const commitButton = document.createElement('button');
    commitButton.id = 'commitButton';
    commitButton.textContent = 'Änderungen übertragen';
    commitButton.disabled = true;

    nav.appendChild(editButton);
    nav.appendChild(saveButton);
    nav.appendChild(cancelButton);
    nav.appendChild(removeButton);
    nav.appendChild(commitButton);

    const header = document.querySelector('header');
    header.appendChild(nav);

    editButton.addEventListener('click', function () {
        editButton.disabled = true;
        saveButton.disabled = false;
        cancelButton.disabled = false;
        removeButton.disabled = false;
        editResource();
    });

    saveButton.addEventListener('click', function () {
        // Selects in neuen Zeilen durch statischen Text ersetzen
        document.querySelectorAll("td select").forEach(select => {
            const cell = select.parentElement;
            const value = select.value;
        
            // Prüfe ob das ein Prefix wie "mpbv:" ist und bilde daraus den URI-Link
            if (value.includes(':')) {
                const [prefix, local] = value.split(':');
                let base;
                if (prefix === 'mpbv') {
                    base = "http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#";
                } else {
                    base = ''; // Optional: andere Prefixes behandeln
                }
        
                const uri = base + local;
                const a = document.createElement('a');
                a.className = "resource extern";
                a.href = uri;
                a.setAttribute("uri", uri);
                a.setAttribute("rel", "nofollow");
                a.setAttribute("target", "_blank");
                a.textContent = value;
        
                cell.innerHTML = '';
                cell.appendChild(a);
            } else {
                // fallback: als plain text anzeigen
                cell.textContent = value;
            }
        });
        
  
  // Neu hinzugefügte Zeilen im gleichen Stil wie bestehende darstellen
  document.querySelectorAll("tr.custom").forEach(row => {
    row.classList.remove("custom");
  });
  
        editButton.disabled = false;
        saveButton.disabled = true;
        cancelButton.disabled = true;
        removeButton.disabled = true;
        saveResource();
    });

    cancelButton.addEventListener('click', function () {
        editButton.disabled = false;
        saveButton.disabled = true;
        cancelButton.disabled = true;
        removeButton.disabled = true;
        cancelResource();
    });

    removeButton.addEventListener('click', function () {
        editButton.disabled = false;
        saveButton.disabled = true;
        cancelButton.disabled = true;
        removeButton.disabled = true;
        removeStorage();
    });
});

function replaceQuotes(text) {
    return text.replace(/"/g, '&quot;');
}
