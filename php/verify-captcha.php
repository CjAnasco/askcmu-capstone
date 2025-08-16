<?php
ob_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0); // No HTML error output

// === Custom error handler to always return JSON ===
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    $msg = "PHP Error [$errno]: $errstr in $errfile on line $errline";
    file_put_contents(__DIR__ . "/debug.log", $msg . "\n", FILE_APPEND);
    ob_end_clean();
    echo json_encode(['success' => false, 'error' => $msg]);
    exit;
});

// === Start log ===
file_put_contents(__DIR__ . "/debug.log", "\n=== CAPTCHA Verification Start (" . date('Y-m-d H:i:s') . ") ===\n", FILE_APPEND);

// === Secret key ===
$secretKey = "6Le2vqMrAAAAANI62Vk4UllWsoeUahl1RVNSLs-m";

// === Get token from POST ===
$responseToken = $_POST['g-recaptcha-response'] ?? '';
file_put_contents(__DIR__ . "/debug.log", "Received token: " . var_export($responseToken, true) . "\n", FILE_APPEND);

if (empty($responseToken)) {
    ob_end_clean();
    echo json_encode(['success' => false, 'error' => 'Missing CAPTCHA token']);
    exit;
}

// === Prepare request to Google ===
$verifyURL = "https://www.google.com/recaptcha/api/siteverify";
$requestData = [
    'secret'   => $secretKey,
    'response' => $responseToken,
    'remoteip' => $_SERVER['REMOTE_ADDR'] ?? ''
];
file_put_contents(__DIR__ . "/debug.log", "Request Data: " . print_r($requestData, true) . "\n", FILE_APPEND);

// === Send request via file_get_contents ===
$options = [
    'http' => [
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($requestData),
        'timeout' => 5
    ]
];

$context = stream_context_create($options);
$rawResponse = @file_get_contents($verifyURL, false, $context);

// === Log raw output before checks ===
file_put_contents(__DIR__ . "/debug.log", "Raw response: " . var_export($rawResponse, true) . "\n", FILE_APPEND);

// === Check for empty or failed response ===
if ($rawResponse === false || trim($rawResponse) === '') {
    file_put_contents(__DIR__ . "/debug.log", "Empty or failed response from Google\n", FILE_APPEND);
    ob_end_clean();
    echo json_encode(['success' => false, 'error' => 'Failed to contact reCAPTCHA server']);
    exit;
}

// === Decode JSON ===
$captchaResult = json_decode($rawResponse, true);

// === Log decoded result ===
file_put_contents(__DIR__ . "/debug.log", "Decoded response: " . print_r($captchaResult, true) . "\n", FILE_APPEND);

// === Return JSON result ===
ob_end_clean();
echo json_encode([
    'success' => $captchaResult['success'] ?? false,
    'score'   => $captchaResult['score'] ?? null,
    'action'  => $captchaResult['action'] ?? null,
    'errors'  => $captchaResult['error-codes'] ?? []
]);
