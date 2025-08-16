<?php
header('Content-Type: application/json');
error_reporting(0); // ✅ Suppress warnings

$userId = $_GET['user_id'] ?? 'Student';
$safeUserId = preg_replace('/[^a-zA-Z0-9_-]/', '', $userId);
$file = __DIR__ . '/../admin/chatlogs/' . $safeUserId . '.json';

if (file_exists($file)) {
    $content = file_get_contents($file);
    $json = json_decode($content, true);

    // ✅ Filter out empty entries
    $filtered = array_filter($json, function ($entry) {
        return !empty($entry['user']) && !empty($entry['bot']);
    });

    echo json_encode(array_values($filtered));
} else {
    echo json_encode([]);
}
?>
