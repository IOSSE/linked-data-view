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
    })
}

function saveResource() {

 

    const literalCells = document.querySelectorAll("td.literal");
    literalCells.forEach((element) => {
        const inputElement = element.firstElementChild;
        let value;
        if (inputElement) {
            value = replaceQuotes(inputElement.value);
        } 
        else {
            value = replaceQuotes(element.textContent);   
        }       
        const predicate = element.previousElementSibling;
        // Füge diese Werte dem Storage hinzu wenn er sich verändert hat
        if (value!=element.getAttribute('save')) {
            element.classList.add('new');
            localStorage.setItem(resource+'$'+predicate.textContent, value);
        }
        element.innerHTML = value;
        
    })

    // Überprüfe ob das Lebel gemäß der definierten Regeln angepasst werden muss
    checkLabel();




}

function cancelResource() {

    const literalCells = document.querySelectorAll("td.literal");
    literalCells.forEach((element) => {
       element.innerHTML = element.getAttribute('save');
    });

}

function checkLabel() {

    // Ermittel rdf:type
    const rdfTypeElement = document.querySelector('td.resource a[uri="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"]');
    
    if (rdfTypeElement) {
        // Textinhalt oder anderer Wert, je nachdem, was du benötigst
        const rdfTypeValue = rdfTypeElement.parentElement.nextElementSibling.textContent.trim();
        const labelConstruct = config.defineLabel[rdfTypeValue];
        if (labelConstruct) {

            let value;
            // Funktion, um die Platzhalter durch die entsprechenden Werte zu ersetzen
            const replacedText = labelConstruct.replace(/{(.*?)}/g, (match, key) => {
                // Versuche, den Wert aus dem Objekt zu holen
                if (key.startsWith('fkt_')) {
                    // Überprüfen, ob diese Funktion im globalen Objekt existiert
                    if (typeof globalThis[key] === 'function') {
                        // Funktion dynamisch ausführen
                        value = globalThis[key]();
                    }
                    else {
                            console.warn(`Keine Funktion namens ${functionName} definiert.`);
                        }
                }
                else {
                    const keyValue = document.querySelector('td.resource a[uri="'+key+'"]');
                    if (keyValue) {
                        value = keyValue.parentElement.nextElementSibling.textContent.trim();
                    }
                    else {
                        value='';
                    } 
                }
                // Gibt entweder den gefundenen Wert oder den Original-Placeholder zurück (falls keiner gefunden wurde)
                return value !== undefined ? value : match;
            });
            console.log(replacedText);
            const labelElementKey = document.querySelector('td.resource a[uri="http://www.w3.org/2000/01/rdf-schema#label"]');
            if (labelElementKey) {
                const labelElement = labelElementKey.parentElement.nextElementSibling;
                if (labelElement.textContent!=replacedText) {
                    labelElement.textContent = replacedText;
                    labelElement.classList.add('new');
                    document.title = replacedText;
                    document.querySelector('h1').textContent = replacedText;
                    localStorage.setItem(resource+'$rdfs:label', replacedText);
                }
            }
             

        }
    }


}

function loadFromStore() {

    // Literals
    const literalCells = document.querySelectorAll("td.literal");
    literalCells.forEach((element) => {
        const predicate = element.previousElementSibling;
        const value = localStorage.getItem(resource+'$'+predicate.textContent);
         if (value !== null) {
            element.textContent = value;
            element.classList.add('new');
            if (predicate.textContent=='rdfs:label') {
                document.title = value;
                // Auswahl des ersten <h1>-Elements
                const firstH1 = document.querySelector('h1');
                console.log(firstH1.textContent);
                firstH1.textContent = value;
            }        
        }
    })    

    // Resources
    const resourceCells = document.querySelectorAll("a.resource.intern");
    resourceCells.forEach((element) => {
        const predicate = element.parentElement.previousElementSibling;
      
        const value = localStorage.getItem(element.getAttribute('uri')+'$rdfs:label');
        if (value !== null) {
            element.textContent = value;
            element.parentElement.classList.add('new');
        }
    })    

    checkLabel();

}

function removeStorage() {
    localStorage.clear();
    window.location.reload(true);
}


document.addEventListener('DOMContentLoaded', function() {


            // Ressource ermitteln
            resource = document.getElementById('resource').textContent;

            // Load Values from local Store, if exist
            loadFromStore();

            // Das <nav>-Element erstellen
            const nav = document.createElement('nav');

            // Die Schaltflächen erstellen
            const editButton = document.createElement('button');
            editButton.id = 'editButton';
            editButton.textContent = 'Bearbeiten';
        
            const saveButton = document.createElement('button');
            saveButton.id = 'saveButton';
            saveButton.textContent = 'Speichern';
            saveButton.disabled= true;


            const cancelButton = document.createElement('button');
            cancelButton.id = 'cancelButton';
            cancelButton.textContent = 'Abbrechen';
            cancelButton.disabled= true;

            const removeButton = document.createElement('button');
            removeButton.id = 'removeButton';
            removeButton.textContent = 'Änderungen verwerfen';
            removeButton.disabled= true;

            const commitButton = document.createElement('button');
            commitButton.id = 'commitButton';
            commitButton.textContent = 'Änderungen übertragen';
            commitButton.disabled= true;


            // Die Schaltflächen dem <nav>-Element hinzufügen
            nav.appendChild(editButton);
            nav.appendChild(saveButton);
            nav.appendChild(cancelButton);
            nav.appendChild(removeButton);
            nav.appendChild(commitButton);


            // Das <nav>-Element dem <header> hinzufügen
            const header = document.querySelector('header');
            header.appendChild(nav);

            // Event-Listener für die Schaltflächen hinzufügen
            editButton.addEventListener('click', function() {
                console.log('Bearbeiten gestartet');
                editButton.disabled = true;
                saveButton.disabled = false;
                cancelButton.disabled = false;
                removeButton.disabled = false;
                editResource();

            });

            saveButton.addEventListener('click', function() {
                console.log('Änderungen gespeichert');
                editButton.disabled = false;
                saveButton.disabled = true;
                cancelButton.disabled = true;
                removeButton.disabled = true;
                saveResource();
            });

            cancelButton.addEventListener('click', function() {
                console.log('Änderungen abgebrochen');
                editButton.disabled = false;
                saveButton.disabled = true;
                cancelButton.disabled = true;
                removeButton.disabled = true;
                cancelResource();
            });

            removeButton.addEventListener('click', function() {
                console.log('Änderungen verwerfen');
                editButton.disabled = false;
                saveButton.disabled = true;
                cancelButton.disabled = true;
                removeButton.disabled = true;
                removeStorage();
            });
        });

function replaceQuotes(text) {
    // Ersetzt alle doppelten Anführungszeichen im Text durch &quot;
    return text.replace(/"/g, '&quot;');
}