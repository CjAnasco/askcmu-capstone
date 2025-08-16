<?php
require_once 'firebase_init.php';

$userId = $_POST['userId'] ?? '';

if (!$userId) {
  http_response_code(400);
  echo "Missing userId.";
  exit;
}

try {
  $docRef = $firestore->collection('chatlogs')->document($userId);
  $docRef->update([
    ['path' => 'archived', 'value' => true]
  ]);
  echo "📦 Chat log for '$userId' archived.";
} catch (Exception $e) {
  http_response_code(500);
  echo "❌ Error archiving log: " . $e->getMessage();
}
