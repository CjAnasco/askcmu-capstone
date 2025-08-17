<?php
function getAccessToken() {
$keyFile = __DIR__ . '/../../backend/serviceaccountKey.json';

  if (!file_exists($keyFile)) {
    throw new Exception("Service account file not found at: $keyFile");
  }

  $key = json_decode(file_get_contents($keyFile), true);
  if ($key === null) {
    throw new Exception("Invalid JSON in service account file.");
  }

  $base64UrlEncode = fn($data) => rtrim(strtr(base64_encode(json_encode($data)), '+/', '-_'), '=');

  $jwtHeader = $base64UrlEncode(["alg" => "RS256", "typ" => "JWT"]);
  $now = time();
  $jwtClaim = $base64UrlEncode([
    "iss" => $key['client_email'],
    "scope" => "https://www.googleapis.com/auth/datastore",
    "aud" => $key['token_uri'],
    "exp" => $now + 3600,
    "iat" => $now
  ]);

  $signatureInput = "$jwtHeader.$jwtClaim";

  $privateKey = openssl_pkey_get_private($key['private_key']);
  if (!$privateKey) {
    throw new Exception("Failed to load private key.");
  }

  openssl_sign($signatureInput, $signature, $privateKey, "sha256WithRSAEncryption");
  $jwtSignature = rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');
  $jwt = "$signatureInput.$jwtSignature";

  $response = file_get_contents($key['token_uri'], false, stream_context_create([
    "http" => [
      "method" => "POST",
      "header" => "Content-Type: application/x-www-form-urlencoded",
      "content" => http_build_query([
        "grant_type" => "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion" => $jwt
      ])
    ]
  ]));

  $responseData = json_decode($response, true);
  if (!isset($responseData['access_token'])) {
    throw new Exception("Failed to retrieve access token.");
  }

  return $responseData['access_token'];
}
