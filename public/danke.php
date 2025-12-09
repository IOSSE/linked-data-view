<?php
$url = $_GET['url'] ?? null;
?>
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title uri="Danke"></title>
    <link rel="stylesheet" href="index.css" />
  </head>
  <body>
    <div class="thank">
        <h1>Danke!</h1>
        <p>Ihre Rückmeldung wurde erfolgreich gesendet.</p>

        <?php if ($url): ?>
          <div class="backwrapper">
            <a class="backbtn" href="<?= htmlspecialchars($url) ?>" rel="nofollow">zurück</a>
          </div>
        <?php endif; ?>  
    </div>
  </body> 
</html>
