<?php
require "env.php";
loadEnv(__DIR__ . "/.env");

// Read form input
$email = $_POST['email'] ?? '';
$name  = $_POST['name'] ?? '';
$desc  = $_POST['desc'] ?? '';
$url  = $_POST['url'] ?? '';

$selectedItemsJson = $_POST['selectedItems'] ?? '[]';
$selectedItems = json_decode($selectedItemsJson, true);

// Start issue body
$body  = "E-Mail: $email\n";
$body .= "Beschreibung:\n$desc\n\n";
$body .= "zur Überprüfung:\n";

if ($email == '' || $name == '') {
    echo '<h2>Error: Empty form</h2>';
    exit;
}

foreach ($selectedItems as $item) {
    $type  = $item['type'] ?? '';
    $value = $item['value'] ?? '';
    $body .= "'$type': $value\n";
    $body .= "\n";
}

// Convert to JSON
$jsonData = json_encode([
    "title" => $name,
    "body"  => $body,
]);
echo "<pre>$jsonData</pre>";

// API endpoint URL
$token = getenv("API_KEY");
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, getenv("API_ENDPOINT"));
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Authorization: token $token",
    "Content-Length: " . strlen($jsonData)
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

if ($response !== false) {
    header("Location: /danke.php?url=" . urlencode($url));
    exit;
}

// Show API response
echo "HTTP Status: $httpCode\n\n";
echo "<h2>API Response:</h2>";
echo "<pre>$response</pre>";