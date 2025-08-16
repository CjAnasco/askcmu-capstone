<?php
header('Content-Type: application/json');

$folder = '../admin/chatlogs/';
$files = glob($folder . '*.json');

$logs = [];

foreach ($files as $file) {
    $filename = basename($file);
    if ($filename === 'faq.json' || $filename === 'config.php') continue;

    $userId = basename($file, '.json');
    $conversation = json_decode(file_get_contents($file), true);

    $logs[] = [
        'userId' => $userId,
        'exchanges' => $conversation
    ];
}

echo json_encode($logs);
