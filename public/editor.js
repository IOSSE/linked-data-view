// Stores the current resource URI
var resource = '';

function editResource() {
    const literalCells = document.querySelectorAll("td.literal");

    literalCells.forEach((element) => {
        const value = replaceQuotes(element.textContent);
        const predicate = element.previousElementSibling;
        element.setAttribute('save', value);

        // Only allow editing if predicate is not protected
        if (!config.protectedPredicates.includes(predicate.textContent)) {
            element.innerHTML = `<input type="text" value="${value}"/>`;
        }

        const predicateText = predicate.textContent;

        // Insert minus button only if not already present and predicate is not protected
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
            minusCell.classList.add('minus-cell');
            minusCell.appendChild(minusButton);

            const row = element.parentElement;
            row.appendChild(minusCell);
        }
    });

    insertPlusButtonRow();
}

function saveResource() {
    const literalCells = document.querySelectorAll("td.literal");

    literalCells.forEach((element) => {
        const inputElement = element.querySelector('input');
        let value = inputElement
            ? replaceQuotes(inputElement.value)
            : replaceQuotes(element.textContent);

        const predicateCell = element.previousElementSibling;
        const pred = predicateCell.querySelector('select')?.value || predicateCell.textContent;

        // Save only if value has changed
        if (value !== element.getAttribute('save')) {
            element.classList.add('new');
            localStorage.setItem(resource + '$' + pred, value);
        }

        // Save new values that were added without a previous "save" attribute
        if (!element.hasAttribute('save')) {
            element.classList.add('new');
            localStorage.setItem(resource + '$' + pred, value);
        }

        // Special case: convert to internal resource link if Lebensabschnitt
        if (pred === 'mpbv:hatLebensabschnitt') {
            const a = document.createElement('a');
            a.className = 'resource intern';
            a.href = value;
            a.setAttribute('uri', value.startsWith('http') ? value : 'http://meta-pfarrerbuch.evangelische-archive.de' + value);
            a.setAttribute('rel', 'nofollow');
            a.textContent = value.split('/').pop();
            element.innerHTML = '';
            element.appendChild(a);
        } else {
            element.innerHTML = value;
        }
    });

    removePlusButtonRow();
    checkLabel();

    // Remove minus buttons and their cells
    document.querySelectorAll(".minus-button").forEach(btn => btn.remove());
    document.querySelectorAll("td.minus-cell").forEach(cell => cell.remove());
}

function cancelResource() {
    const literalCells = document.querySelectorAll("td.literal");

    literalCells.forEach((element) => {
        element.innerHTML = element.getAttribute('save');
    });

    // Remove minus buttons and cells
    document.querySelectorAll(".minus-button").forEach(btn => btn.remove());
    document.querySelectorAll("td.minus-cell").forEach(cell => cell.remove());

    // Remove the plus button row
    removePlusButtonRow();

    // Remove all newly added rows (not yet saved)
    document.querySelectorAll("tr.custom").forEach(row => row.remove());
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

        // Determine RDF type from table
        const typeElement = document.querySelector('td.resource a[uri="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"]');
        let type = null;
        if (typeElement) {
            const fullTypeUri = typeElement.parentElement.nextElementSibling.textContent.trim();
            type = shortenUri(fullTypeUri);
        }

        // Load property options based on type or fallback
        let props = config.properties;
        if (type && config.typeProperties[type]) {
            props = config.typeProperties[type];
        }

        // Populate select dropdown
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
            const replacedText = labelConstruct.replace(/{(.*?)}/g, (match, key) => {
                if (key.startsWith('fkt_') && typeof globalThis[key] === 'function') {
                    return globalThis[key]();
                } else {
                    const keyValue = document.querySelector('td.resource a[uri="' + key + '"]');
                    return keyValue
                        ? keyValue.parentElement.nextElementSibling.textContent.trim()
                        : '';
                }
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

        // Skip if marked for deletion
        if (localStorage.getItem(resource + '$delete$' + pred) !== null) {
            element.parentElement.remove();
            return;
        }

        const value = localStorage.getItem(resource + '$' + pred);
        if (value !== null) {
            // Create URI link in predicate cell if applicable
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

            // Handle value cell
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

            // Update page title if label
            if (pred === 'rdfs:label') {
                document.title = value;
                const firstH1 = document.querySelector('h1');
                firstH1.textContent = value;
            }
        }
    });

    // Update labels of internal resource links
    const resourceCells = document.querySelectorAll("a.resource.intern");

    resourceCells.forEach((element) => {
        const value = localStorage.getItem(element.getAttribute('uri') + '$rdfs:label');
        if (value !== null) {
            element.textContent = value;
            element.parentElement.classList.add('new');
        }
    });

    // Add new rows from localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key.startsWith(resource + '$') && !key.includes('$delete$')) {
            const pred = key.split('$')[1];
            const value = localStorage.getItem(key);

            const exists = Array.from(document.querySelectorAll("td.literal")).some(cell =>
                cell.previousElementSibling.textContent === pred
            );
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

    document.querySelector('header').appendChild(nav);

    editButton.addEventListener('click', function () {
        editButton.disabled = true;
        saveButton.disabled = false;
        cancelButton.disabled = false;
        removeButton.disabled = false;
        editResource();
    });

    saveButton.addEventListener('click', function () {
        // Convert dropdowns into static links or text
        document.querySelectorAll("td select").forEach(select => {
            const cell = select.parentElement;
            const value = select.value;

            if (value.includes(':')) {
                const [prefix, local] = value.split(':');
                let base = prefix === 'mpbv'
                    ? "http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#"
                    : '';

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
                cell.textContent = value;
            }
        });

        // Remove "custom" class from newly added rows
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
