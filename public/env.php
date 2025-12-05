<?php

function loadEnv($path)
{
    if (!file_exists($path)) return;

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        if (str_starts_with($line, '#')) continue;

        list($key, $value) = explode('=', $line, 2);

        $key   = trim($key);
        $value = trim($value);

        // Remove quotes if present
        $value = trim($value, '"');

        putenv("$key=$value");
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}
