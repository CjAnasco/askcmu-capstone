<?php
require_once 'getAccessToken.php';

$userId = $_POST['userId'] ?? null;
if (!$userId) {
  http_response_code(400);
  echo "Missing userId";
  exit;
}

$projectId = 'askcmu';
$accessToken = getAccessToken();

// Step 1: Read original document
$docPath = "projects/$projectId/databases/(default)/documents/chatlogs/$userId";
$getContext = stream_context_create([
  "http" => [
    "method" => "GET",
    "header" => "Authorization: Bearer $accessToken"
  ]
]);
$docJson = file_get_contents("https://firestore.googleapis.com/v1/$docPath", false, $getContext);
$doc = json_decode($docJson, true);

if (!isset($doc['fields'])) {
  echo "Chatlog not found.";
  exit;
}

// Step 2: Write to archive
$archivePath = "projects/$projectId/databases/(default)/documents/archived_chatlogs/$userId";
$putContext = stream_context_create([
  "http" => [
    "method" => "PATCH",
    "header" => [
      "Authorization: Bearer $accessToken",
      "Content-Type: application/json"
    ],
    "content" => json_encode(["fields" => $doc['fields']])
  ]
]);
file_get_contents("https://firestore.googleapis.com/v1/$archivePath", false, $putContext);

// Step 3: Delete original
$deleteContext = stream_context_create([
  "http" => [
    "method" => "DELETE",
    "header" => "Authorization: Bearer $accessToken"
  ]
]);
file_get_contents("https://firestore.googleapis.com/v1/$docPath", false, $deleteContext);

echo "Archived chatlog for $userId";

