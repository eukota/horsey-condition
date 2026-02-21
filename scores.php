<?php
header('Content-Type: application/json');

$scoresFile = 'scores.json';

// Helper to load scores
function loadScores($file)
{
    if (!file_exists($file)) {
        return ['highScores' => [], 'fastTimes' => []];
    }
    $content = file_get_contents($file);
    return json_decode($content, true) ?: ['highScores' => [], 'fastTimes' => []];
}

// Logic for GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $key = $_GET['key'] ?? 'default';
    $data = loadScores($scoresFile);

    $result = $data[$key] ?? ['highScores' => [], 'fastTimes' => []];
    echo json_encode($result);
    exit;
}

// Logic for POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 1. Hardening: Limit input size to 8KB (plenty for a score payload)
    if (($_SERVER['CONTENT_LENGTH'] ?? 0) > 8192) {
        http_response_code(413);
        echo json_encode(['error' => 'Payload too large']);
        exit;
    }

    $input = file_get_contents('php://input');
    $payload = json_decode($input, true);

    if (!$payload || !isset($payload['name'], $payload['score'], $payload['time'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Bad Request']);
        exit;
    }

    $name = strtoupper(substr($payload['name'], 0, 16));
    $score = (int)$payload['score'];
    $time = (int)$payload['time'];
    $finished = (bool)($payload['finished'] ?? true);

    // 2. Hardening: Sanitize and limit settingsKey
    $settingsKey = $payload['settingsKey'] ?? 'default';
    $settingsKey = preg_replace('/[^a-zA-Z0-9:|]/', '', $settingsKey); // Only allow alphanumeric, :, and |
    if (strlen($settingsKey) > 64)
        $settingsKey = substr($settingsKey, 0, 64);
    if (empty($settingsKey))
        $settingsKey = 'default';

    // Lock and update
    $fp = fopen($scoresFile, 'c+');
    if (flock($fp, LOCK_EX)) {
        $filesize = filesize($scoresFile);
        $content = $filesize > 0 ? fread($fp, $filesize) : '{}';
        $fullData = json_decode($content, true) ?: [];

        if (!isset($fullData[$settingsKey])) {
            $fullData[$settingsKey] = ['highScores' => [], 'fastTimes' => []];
        }

        $entry = [
            'name' => $name,
            'score' => $score,
            'time' => $time,
            'finished' => $finished
        ];

        $cat = & $fullData[$settingsKey];

        // 1. High Scores
        $cat['highScores'][] = $entry;
        usort($cat['highScores'], function ($a, $b) {
            if ($b['score'] !== $a['score'])
                return $b['score'] - $a['score'];
            return $a['time'] - $b['time'];
        });
        $cat['highScores'] = array_slice($cat['highScores'], 0, 10);

        // 2. Fast Times
        $cat['fastTimes'][] = $entry;
        usort($cat['fastTimes'], function ($a, $b) {
            if ($a['finished'] !== $b['finished'])
                return $b['finished'] - $a['finished']; // True (1) first
            if ($a['time'] !== $b['time'])
                return $a['time'] - $b['time'];
            return $b['score'] - $a['score'];
        });
        $cat['fastTimes'] = array_slice($cat['fastTimes'], 0, 10);

        // Save back
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($fullData, JSON_PRETTY_PRINT));
        fflush($fp);
        flock($fp, LOCK_UN);

        echo json_encode($cat);
    }
    else {
        http_response_code(500);
        echo json_encode(['error' => 'Could not lock scores file']);
    }
    fclose($fp);
    exit;
}