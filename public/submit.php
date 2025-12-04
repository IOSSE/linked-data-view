<?php

$title = $_POST['title'] ?? '';
$name  = $_POST['name'] ?? '';

// Read selected checkboxes JSON
$selectedItemsJson = $_POST['selectedItems'] ?? '[]';
$selectedItems = json_decode($selectedItemsJson, true);

// Build data array to send to API
$data = [
    'title' => $title,
    'name'  => $name,
    'items' => $selectedItems
];

// Convert to JSON
$jsonData = json_encode($data, JSON_UNESCAPED_UNICODE);


echo "<h2>data:</h2>";
echo "<pre>$jsonData</pre>";
