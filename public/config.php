<?php
/* Configuration */

$protocol='http://'; // used for subject uri
$uri_base='/meta-pfarrerbuch.evangelische-archive.de';
$base='/data'; // used for base folder e.g. when used behind proxy e.g. /data/



$sources = [
    [
        'name' => 'Brandenburg',
        'endpoint' => 'https://meta-pfarrerbuch.evangelische-archive.de/meta-daten/brandenburg/sparql',
        'resource' => $uri_base . '/data/brandenburg/',
    ],
    [
        'name' => 'KPS',
        'endpoint' => 'https://meta-pfarrerbuch.evangelische-archive.de/meta-daten/kps/sparql',
        'resource' => $uri_base . '/data/kps/',
    ],
    [
        'name' => 'Sachsen',
        'endpoint' => 'https://meta-pfarrerbuch.evangelische-archive.de/meta-daten/sachsen/sparql',
        'resource' => $uri_base . '/data/sachsen/',
    ],
];	     

