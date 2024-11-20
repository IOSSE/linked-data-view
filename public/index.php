<?php
// Check mod_rewrite
if (function_exists('apache_get_modules')) {
    $modules = apache_get_modules();
    if (in_array('mod_rewrite', $modules)) {
        echo "mod_rewrite ist aktiviert!";
    } else {
        echo "mod_rewrite ist NICHT aktiviert!"; exit;
    }
} else {
    echo "Funktion apache_get_modules() nicht verfügbar."; exit;
}

// Query-Parameter-Path laden
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
echo "Angefragter Pfad: " . $path;

