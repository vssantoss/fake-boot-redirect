<?php
declare(strict_types=1);

$templates = [
    'retro-bios' => __DIR__ . '/retro-bios.html',
    'linux-terminal' => __DIR__ . '/linux-terminal.html',
    'modern-glass' => __DIR__ . '/modern-glass.html',
    'cyberpunk-matrix' => __DIR__ . '/cyberpunk-matrix.html',
];

$cookieName = 'boot_template';
$cookieLifetime = 5; // minutes
$templateKeys = array_keys($templates);

$requestedTemplate = isset($_GET['template']) ? (string) $_GET['template'] : '';
$selectedTemplate = isset($_COOKIE[$cookieName]) ? (string) $_COOKIE[$cookieName] : '';

if (array_key_exists($requestedTemplate, $templates)) {
    $selectedTemplate = $requestedTemplate;
} elseif (!array_key_exists($selectedTemplate, $templates) || isset($_GET['shuffle'])) {
    $selectedTemplate = $templateKeys[random_int(0, count($templateKeys) - 1)];
}

setcookie($cookieName, $selectedTemplate, [
    'expires' => time() + ($cookieLifetime * 60),
    'path' => '/',
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Lax',
]);

$templatePath = $templates[$selectedTemplate];

if (!is_file($templatePath) || !is_readable($templatePath)) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=UTF-8');
    echo 'Selected boot template is unavailable.';
    exit;
}

header('Content-Type: text/html; charset=UTF-8');
readfile($templatePath);
