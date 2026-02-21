<?php
header('Content-Type: application/json');

$isLocal = strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false
        || strpos($_SERVER['HTTP_HOST'] ?? '', '0.0.0.0') !== false;

if ($isLocal) {
    ini_set('display_errors', 1);
    error_reporting(E_ALL);
}

// ── database connection ───────────────────────────────────
// Local: always SQLite. Deployed: MySQL via db_config.php, SQLite fallback.
function connectDb($isLocal) {
    if (!$isLocal) {
        foreach (['db_config.php', '../db_config.php', '../horsey_db_config.php'] as $f) {
            $absPath = __DIR__ . '/' . $f;
            if (file_exists($absPath)) { require_once $absPath; break; }
        }
        $host = getenv('DB_HOST') ?: (defined('DB_HOST') ? DB_HOST : null);
        $name = getenv('DB_NAME') ?: (defined('DB_NAME') ? DB_NAME : null);
        $user = getenv('DB_USER') ?: (defined('DB_USER') ? DB_USER : null);
        $pass = getenv('DB_PASS') ?: (defined('DB_PASS') ? DB_PASS : null);

        if ($host && $name && $user && strpos($host, 'yourdomain.com') === false) {
            return new PDO("mysql:host=$host;dbname=$name;charset=utf8mb4", $user, $pass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::ATTR_TIMEOUT            => 2,
            ]);
        }
    }

    // SQLite (local dev or deployed fallback)
    $pdo = new PDO('sqlite:' . __DIR__ . '/scores.db');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec("CREATE TABLE IF NOT EXISTS leaderboard (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        name     TEXT    NOT NULL,
        score    REAL    NOT NULL,
        time     INTEGER NOT NULL,
        finished INTEGER NOT NULL DEFAULT 1,
        settings_key TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    return $pdo;
}

try {
    $pdo = connectDb($isLocal);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// One-time migration: widen score column to FLOAT for decimal time bonus scores
if (!$isLocal) {
    try { $pdo->exec("ALTER TABLE leaderboard MODIFY COLUMN score FLOAT NOT NULL DEFAULT 0"); } catch (Exception $e) { /* already done or not needed */ }
}

// ── helpers ───────────────────────────────────────────────
function fetchLeaderboard($pdo, $key) {
    $stmt = $pdo->prepare("SELECT name, score, time, finished FROM leaderboard
                           WHERE settings_key = ? ORDER BY score DESC, time ASC LIMIT 10");
    $stmt->execute([$key]);
    $highScores = $stmt->fetchAll();

    $stmt = $pdo->prepare("SELECT name, score, time, finished FROM leaderboard
                           WHERE settings_key = ? ORDER BY finished DESC, time ASC, score DESC LIMIT 10");
    $stmt->execute([$key]);
    $fastTimes = $stmt->fetchAll();

    return ['highScores' => $highScores, 'fastTimes' => $fastTimes];
}

// ── GET ───────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $key = $_GET['key'] ?? 'default';
    echo json_encode(fetchLeaderboard($pdo, $key));
    exit;
}

// ── POST ──────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (($_SERVER['CONTENT_LENGTH'] ?? 0) > 8192) {
        http_response_code(413);
        echo json_encode(['error' => 'Payload too large']);
        exit;
    }

    $payload = json_decode(file_get_contents('php://input'), true);
    if (!$payload || !isset($payload['name'], $payload['score'], $payload['time'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Bad Request']);
        exit;
    }

    $name     = strtoupper(substr($payload['name'], 0, 16));
    $score    = (float)$payload['score'];
    $time     = (int)$payload['time'];
    $finished = (bool)($payload['finished'] ?? true);

    $settingsKey = preg_replace('/[^a-zA-Z0-9:|]/', '', $payload['settingsKey'] ?? 'default');
    if (strlen($settingsKey) > 64) $settingsKey = substr($settingsKey, 0, 64);
    if (empty($settingsKey))       $settingsKey = 'default';

    $pdo->prepare("INSERT INTO leaderboard (name, score, time, finished, settings_key)
                   VALUES (?, ?, ?, ?, ?)")
        ->execute([$name, $score, $time, $finished ? 1 : 0, $settingsKey]);

    echo json_encode(fetchLeaderboard($pdo, $settingsKey));
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
