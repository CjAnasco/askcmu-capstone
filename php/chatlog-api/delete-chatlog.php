<?php
require_once 'getAccessToken.php';

$userId = $_POST['userId'] ?? null;
if (!$userId) {
  http_response_code(400);
  echo "Missing userId";
  exit;
}

$projectId = 'askcmu';
$collection = 'chatlogs';
$documentPath = "projects/$projectId/databases/(default)/documents/$collection/$userId";
$accessToken = getAccessToken();

// ✅ Delete Firestore document
$opts = [
  "http" => [
    "method" => "DELETE",
    "header" => "Authorization: Bearer $accessToken"
  ]
];

$context = stream_context_create($opts);
$response = file_get_contents("https://firestore.googleapis.com/v1/$documentPath", false, $context);

// ✅ Delete local JSON file
$safeUserId = preg_replace('/[^a-zA-Z0-9_-]/', '', $userId);
$jsonPath = __DIR__ . "/../../admin/chatlogs/{$safeUserId}.json";

if (file_exists($jsonPath)) {
  if (unlink($jsonPath)) {
    echo "✅ Deleted Firestore and JSON for $userId";
  } else {
    echo "❌ Firestore deleted, but failed to delete JSON for $userId";
  }
} else {
  echo "⚠️ Firestore deleted. JSON file not found for $userId at $jsonPath";
}
