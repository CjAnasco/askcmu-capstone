<?php
error_reporting(0); // ✅ Suppress warnings
header('Content-Type: application/json'); // ✅ Only applies if called directly

function logChat($userId, $userMsg, $botReply) {
    $safeUserId = preg_replace('/[^a-zA-Z0-9_-]/', '', $userId);
    $folder = __DIR__ . '/../admin/chatlogs/';
    if (!is_dir($folder)) {
        mkdir($folder, 0775, true);
    }

    $logFile = $folder . $safeUserId . '.json';

    $newEntry = [
        "timestamp" => date("Y-m-d H:i:s"),
        "user" => $userMsg,
        "bot" => $botReply
    ];

    $existing = [];
    if (file_exists($logFile)) {
        $json = file_get_contents($logFile);
        $existing = json_decode($json, true);
        if (!is_array($existing)) {
            $existing = [];
        }
    }

    $existing[] = $newEntry;

    $fp = fopen($logFile, 'w');
    if ($fp && flock($fp, LOCK_EX)) {
        fwrite($fp, json_encode($existing, JSON_PRETTY_PRINT));
        fflush($fp);
        flock($fp, LOCK_UN);
    }
    if ($fp) fclose($fp);
}

// ✅ Only respond if accessed directly
if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'])) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $userId = $_POST['userName'] ?? 'Student';
        $userMsg = $_POST['user'] ?? '';
        $botReply = $_POST['bot'] ?? '';

        if (trim($userMsg) !== '' && trim($botReply) !== '') {
            logChat($userId, $userMsg, $botReply);
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "skipped"]);
        }
    }
}
?>
