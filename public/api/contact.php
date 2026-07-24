<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['message' => 'Methode nicht erlaubt.']);
}

// Unsichtbares Honeypot-Feld: echte Besucher lassen es leer.
if (!empty($_POST['website'] ?? '')) {
    respond(400, ['message' => 'Ungültige Anfrage.']);
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$company = trim((string) ($_POST['company'] ?? ''));
$project = trim((string) ($_POST['project'] ?? ''));
$budget = trim((string) ($_POST['budget'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

if (mb_strlen($name) < 2 || mb_strlen($name) > 120) {
    respond(422, ['message' => 'Bitte gib einen gültigen Namen ein.']);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) {
    respond(422, ['message' => 'Bitte gib eine gültige E-Mail-Adresse ein.']);
}
if (mb_strlen($project) > 120) {
    respond(422, ['message' => 'Bitte wähle eine Projektart aus.']);
}
if (mb_strlen($budget) > 120) {
    respond(422, ['message' => 'Bitte wähle einen Budgetrahmen aus.']);
}
if (mb_strlen($message) > 10000) {
    respond(422, ['message' => 'Die Nachricht muss zwischen 20 und 10.000 Zeichen enthalten.']);
}

$privateConfigPaths = [
    dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'db-config.php',
    dirname(__DIR__) . DIRECTORY_SEPARATOR . 'private-config' . DIRECTORY_SEPARATOR . 'db-config.php',
];
$privateConfig = [];

foreach ($privateConfigPaths as $privateConfigPath) {
    if (is_readable($privateConfigPath)) {
        $loadedConfig = require $privateConfigPath;
        if (is_array($loadedConfig)) {
            $privateConfig = $loadedConfig;
            break;
        }
    }
}

// A private config file outside public_html takes precedence. Environment
// variables remain supported for hosts that expose them to the PHP runtime.
$host = $privateConfig['host'] ?? getenv('DB_HOST');
$database = $privateConfig['name'] ?? getenv('DB_NAME');
$user = $privateConfig['user'] ?? getenv('DB_USER');
$password = $privateConfig['password'] ?? getenv('DB_PASSWORD');

if (!$host || !$database || !$user || $password === false) {
    $missing = [];
    if (!$host) $missing[] = 'DB_HOST';
    if (!$database) $missing[] = 'DB_NAME';
    if (!$user) $missing[] = 'DB_USER';
    if ($password === false) $missing[] = 'DB_PASSWORD';
    respond(500, [
        'message' => 'Datenbank-Konfiguration fehlt: ' . implode(', ', $missing) . '.',
    ]);
}

try {
    $pdo = new PDO(
        "mysql:host={$host};dbname={$database};charset=utf8mb4",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ],
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS contact_messages (' .
        'id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,' .
        'name VARCHAR(120) NOT NULL,' .
        'email VARCHAR(190) NOT NULL,' .
        'company VARCHAR(190) NULL,' .
        'project VARCHAR(120) NOT NULL,' .
        'budget VARCHAR(120) NOT NULL,' .
        'message TEXT NOT NULL,' .
        'created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP' .
        ') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
    );

    $statement = $pdo->prepare(
        'INSERT INTO contact_messages (name, email, company, project, budget, message) ' .
        'VALUES (:name, :email, :company, :project, :budget, :message)'
    );
    $statement->execute([
        ':name' => $name,
        ':email' => $email,
        ':company' => $company !== '' ? $company : null,
        ':project' => $project,
        ':budget' => $budget,
        ':message' => $message,
    ]);
} catch (Throwable $error) {
    error_log('Contact form database error: ' . $error->getMessage());
    $errorCode = $error instanceof PDOException ? (string) $error->getCode() : 'unknown';
    respond(500, [
        'message' => 'Datenbankverbindung fehlgeschlagen (Fehlercode ' . $errorCode . ').',
    ]);
}

respond(201, ['message' => 'Anfrage erfolgreich gespeichert.']);
