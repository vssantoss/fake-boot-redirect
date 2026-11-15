<?php
declare(strict_types=1);

// Template keys; each is served from <key>.html next to this file.
$templates = ['retro-bios', 'linux-terminal', 'modern-glass', 'cyberpunk-matrix'];

$cookieName = 'boot_template';
$cookieLifetime = 5; // minutes

$requestedTemplate = isset($_GET['template']) ? (string) $_GET['template'] : '';
$selectedTemplate = isset($_COOKIE[$cookieName]) ? (string) $_COOKIE[$cookieName] : '';

if (in_array($requestedTemplate, $templates, true)) {
    $selectedTemplate = $requestedTemplate;
} elseif (!in_array($selectedTemplate, $templates, true) || isset($_GET['shuffle'])) {
    $selectedTemplate = $templates[random_int(0, count($templates) - 1)];
}

setcookie($cookieName, $selectedTemplate, [
    'expires' => time() + ($cookieLifetime * 60),
    'path' => '/',
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Lax',
]);

$templatePath = __DIR__ . "/{$selectedTemplate}.html";

if (!is_file($templatePath) || !is_readable($templatePath)) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=UTF-8');
    echo 'Selected boot template is unavailable.';
    exit;
}

header('Content-Type: text/html; charset=UTF-8');
readfile($templatePath);
