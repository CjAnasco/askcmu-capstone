<?php
$userId = $_POST['user_id'];
$userMessage = $_POST['user'];
$botMessage = $_POST['bot'];

$file = '../admin/chatlogs/' . $userId . '.json';

$conversation = file_exists($file)
    ? json_decode(file_get_contents($file), true)
    : [];

$conversation[] = [
    'timestamp' => date('Y-m-d H:i:s'),
    'user' => $userMessage,
    'bot' => $botMessage
];

file_put_contents($file, json_encode($conversation, JSON_PRETTY_PRINT));
echo json_encode(['status' => 'saved']);
?>
