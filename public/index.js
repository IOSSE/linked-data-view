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

    element.textContent = newHref; // Optional: Ändere auch den sichtbaren Text
});
