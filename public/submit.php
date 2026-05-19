<?php
require "env.php";
loadEnv(__DIR__ . "/.env");



// Einfache Funktion, die auf Zeichenfolgen mit typischen Injection-Mustern prüft:
function hasInjectionPattern($input) {
    // Typische gefährliche Patterns (Einige Beispiele! Je nach Bedarf erweiterbar)
    $patterns = [
        '/<\s*script[^>]*>.*?<\s*\/\s*script\s*>/is', // <script>...</script>
        '/<\s*iframe[^>]*>.*?<\s*\/\s*iframe\s*>/is', // <iframe>...</iframe>
        '/([\';]+|(--)+)/',                           // SQL-Injection (' or --)
        '/<[^>]*>/',                                 // Irgendein HTML-Tag
        '/(\b(?:eval|base64_decode|system|passthru|shell_exec|exec|popen|proc_open)\b)/i', // typische PHP-Funktionen
        '/\b(alert|confirm|prompt)\s*\(/i',           // Javascript-Dialoge
    ];
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $input)) {
            return true;
        }
    }
    return false;
}


// Read form input
$email = $_POST['email'] ?? '';
$name  = $_POST['name'] ?? '';
$name= "`".$name."`";
$desc  = $_POST['desc'] ?? '';
$url  = $_POST['url'] ?? '';
$title  = $_POST['title'] ?? '';
$dataset  = $_POST['dataset'] ?? '';

if ($email == '' || $name == '') {
    echo '<h2>Error: Empty form</h2>';
    exit;
}
$selectedItemsJson = $_POST['selectedItems'] ?? '[]';

// ceck for injection
if (hasInjectionPattern(strval($email))) $email='Warnung: Mögliches Injection-Muster erkannt!';
if (hasInjectionPattern(strval($name))) $name='Warnung: Mögliches Injection-Muster erkannt!';
if (hasInjectionPattern(strval($desc))) $desc='Warnung: Mögliches Injection-Muster erkannt!';
if (hasInjectionPattern(strval($url))) $url='Warnung: Mögliches Injection-Muster erkannt!';
if (hasInjectionPattern(strval($selectedItemsJson))) $selectedItemsJson='Warnung: Mögliches Injection-Muster erkannt!';



// Start issue body
$body  = "Ressource: $url\n---\n";
$body  = "Absender: `$name <$email>`\n";
$body .= "Beschreibung:\n$desc\n\n";

if ($selectedItemsJson !== '[]') {
    $selectedItems = json_decode($selectedItemsJson, true);

    $body .= "Zu überprüfende Informationen:\n";
    foreach ($selectedItems as $item) {
        $type  = $item['type'] ?? '';
        $value = $item['value'] ?? '';
        $body .= "'$type': $value\n";
        $body .= "\n";
    }   
}

$assignees = getenv("ASSIGNEES");
$assigneesArray = array_map('trim', explode(',', $assignees));


// Extract the name of the dataset from $uri
$dataset=$base;

// Convert to JSON
$jsonData = json_encode([
    "title" => $dataset.": ".$title,
    "body"  => $body,
    "assignees" => $assigneesArray,
]);

// API endpoint URL
$token = getenv("API_KEY");
$endpoint =  getenv("API_ENDPOINT");
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $endpoint);
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

if ($httpCode == 201) {
    // go back to previous resource
    header("Location: danke.php?url=" . urlencode($url));
    exit;
}

// Show API response
//echo "<p>Endpoint: $endpoint</p>";
echo "<pre>$jsonData</pre>";
echo "HTTP Status: $httpCode\n\n";

echo "<h2>API Response:</h2>";
echo "<pre>$response</pre>";
