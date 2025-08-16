<?php
header('Content-Type: application/json');
error_reporting(0); // ✅ Suppress warnings

// ✅ Include logging function safely
require_once 'logChat.php';

$query = $_POST['query'] ?? '';
$userName = $_POST['userName'] ?? '';

if (!$query) {
    echo json_encode(['response' => 'No query received.']);
    exit;
}

// ✅ Escape input safely
$escapedQuery = escapeshellarg($query);
$escapedName = escapeshellarg($userName);

// ✅ Define paths
$pythonPath = "C:\\Users\\Cj\\AppData\\Local\\Programs\\Python\\Python313\\python.exe";
$scriptPath = realpath(__DIR__ . '/../backend/pseudo_ai.py');

// ✅ Build command (pass userName as second argument)
$command = "\"$pythonPath\" \"$scriptPath\" $escapedQuery $escapedName 2>&1";

// 🧪 Run command
$output = shell_exec($command);

// 🔁 Retry once if empty
if (!$output) {
    usleep(200000); // wait 200ms
    $output = shell_exec($command);
}

// 🧼 Final response
$response = $output ? trim($output) : 'No response from Python.';

// 🪵 Log for debugging
file_put_contents(__DIR__ . "/debug.log", "Command: $command\nQuery: $query\nUserName: $userName\nOutput: $response\n", FILE_APPEND);

// 📝 Store chat log only if response is valid
if (trim($query) !== '' && trim($response) !== '') {
    logChat($userName, $query, $response);
}

// 📤 Send clean JSON
echo json_encode(['response' => $response]);
?>
