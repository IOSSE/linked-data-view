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
    "mpbv:Pfarrer-in",
    "mpbv:Geburt"
  ],
  definelable: {
    "mpbv:Pfarrer-in": "{mpbv:nachname}, {mpbv:vorname}:",
    "mpbv:Geburt": "Geboren am {mpbv:jahr}"
  }
};
