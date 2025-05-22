const config = {
  protectedPredicates: [
    "rdf:type", 
    "rdfs:label"
  ],
  properties: [
    "rdf:type",
    "rdfs:label",
    "mpbv:hatLebensabschnitt",
    "mpbv:vorname",
    "mpbv:nachname",
    "mpbv:datum",	
    "mpbv:jahr",
    "mpbv:Geburt"
  ],
  defineLabel: {
    "mpbv:Pfarrer-in": "{http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#nachname}, {http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#vorname} {fkt_dates}",
    "mpbv:Geburt": "geboren {http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#jahr} in {http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#hatOrt}",
    "mpbv:Tod": "gestorben {http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#jahr} in {http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#hatOrt}",
    "mpbv:Pfarrstelle": "{http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#von} - {http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#bis} {http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#stelle}"

}
};


function fkt_dates() {
    const resourceCells = document.querySelectorAll("td>a.resource");
    let birth;
    let death;
    const pattern = /\d{4}/;
    resourceCells.forEach((element) => {
        const value = element.textContent;

        if (value.startsWith('geboren ')) {
            birth = '*'+value.match(pattern);
        } 
        if (value.startsWith('gestorben ')) {
            death = '†'+value.match(pattern);
        } 
    })

    return '('+birth+'-'+death+')'
} 

 // Erstelle ein neues <style>-Element
const styleElement = document.createElement('style');

// Füge den CSS-Code als Textknoten hinzu
styleElement.textContent = `

    td.literal > input {
                    width: 100%;
                    border-width: 1px;
                    margin: 0px;
                    border-color: green;
    }
    .new {
        background-color: #e9ff33!important
    }

    `;

// Füge das <style>-Element in den <head>-Bereich ein
document.head.appendChild(styleElement);