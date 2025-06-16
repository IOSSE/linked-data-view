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

  typeProperties: {
    "mpbv:Pfarrer-in": 
    ["rdf:type",
      "rdfs:label",
      "mpbv:hatLebensabschnitt",
      "mpbv:vorname",
      "mpbv:nachname",
      "mpbv:datum",	
      "mpbv:jahr",
      "mpbv:Geburt"],

    "mpbv:Ordination": ["mpbv:datum", "mpbv:jahr", "mpbv:hatLebensabschnitt"],
    "mpbv:Ausbildung": ["mpbv:hatLebensabschnitt"],
    "mpbv:Pfarrstelle": ["mpbv:von", "mpbv:stelle", "mpbv:hatLebensabschnitt"]
  },

  defineLabel: {
    "mpbv:Pfarrer-in": "{http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#nachname}, {http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#vorname} {fkt_dates}",
    "mpbv:Geburt": "geboren {http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#jahr} in {http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#hatOrt}",
    "mpbv:Tod": "gestorben {http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#jahr} in {http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#hatOrt}",
    "mpbv:Pfarrstelle": "{http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#von} - {http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#bis} {http://meta-pfarrerbuch.evangelische-archive.de/vocabulary#stelle}"

}
};