const currentUri = window.location.href;

console.log(currentUri);

document.querySelectorAll ('a.resource.intern').forEach(function(element) {

	const Http = new XMLHttpRequest();
	
	
	url=element.href;

	console.log(url);

	Http.open("GET", url+'.label', false);
	Http.send();

	if (Http.responseText!='') element.textContent = Http.responseText;

});


document.querySelectorAll('a.resource.extern').forEach(function(element) {
    let href = element.getAttribute('href');
    let newHref = href;

    const prefixes = {
        'http://www.w3.org/1999/02/22-rdf-syntax-ns#': 'rdf:',
        'http://www.w3.org/2000/01/rdf-schema#': 'rdfs:',
        'http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#': 'mpbv:'
    };

    for (let [base, prefix] of Object.entries(prefixes)) {
        if (href.startsWith(base)) {
            newHref = href.replace(base, prefix);
            break;
        }
    }
    element.target='_blank'; // Fügt target="_blank" hinzu
    element.textContent = newHref; // Optional: Ändere auch den sichtbaren Text
});

document.querySelectorAll('td input.item-edit').forEach(function(element) {
    let href = element.getAttribute("data-type");
    let newHref = href;
    
    const prefixes = {
        'http://www.w3.org/1999/02/22-rdf-syntax-ns#': 'rdf:',
        'http://www.w3.org/2000/01/rdf-schema#': 'rdfs:',
        'http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#': 'mpbv:'
    };

    for (let [base, prefix] of Object.entries(prefixes)) {
        if (href.startsWith(base)) {
            newHref = href.replace(base, prefix);
            break;
        }
    }
    element.setAttribute("data-type", newHref);
});

document.getElementById('feedback-toggle').addEventListener('change', function () {
    const items = document.querySelectorAll('.item-edit');

    items.forEach(item => {
        if (this.checked) {
            item.hidden = false; 
        } else {
            item.hidden = true;  
        }
    });
});

document.getElementById('feedback-form').addEventListener('submit', function () {
    const checkboxes = document.querySelectorAll('.item-edit');
    const result = [];

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            result.push({
                type: checkbox.getAttribute("data-type"),
                value: checkbox.getAttribute("data-value")
            });
        }
    });

    // Put JSON into hidden input
    document.getElementById('selectedItems').value = JSON.stringify(result);
    console.log(JSON.stringify(result));
});

document.getElementById('clear-btn').addEventListener('click', function () {
    document.getElementById('title').value = '';
    document.getElementById('name').value = '';

    const checkboxes = document.querySelectorAll('.item-edit');
    checkboxes.forEach(cb => cb.checked = false);

    document.getElementById('selectedItems').value = '';
});
