<?php
// Query-Parameter entfernen
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
echo "Angefragter Pfad: " . $path;
