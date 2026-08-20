# Venue Booking Application - Complete PHP POST Migration & Protection Guide

This document provides a complete guide, exact PHP scripts, domain standardization (`www.`), and inspect element protection for the **Venue Booking Application** (`venue-booking-app`).

---

## 📑 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Domain Standardization (`www.` Redirects)](#2-domain-standardization-www-redirects)
3. [Inspect Element & DevTools Protection](#3-inspect-element--devtools-protection)
4. [PHP Endpoint 1: Email Notifications (`send-email.php`)](#4-php-endpoint-1-email-notifications-send-emailphp)
5. [PHP Endpoint 2: Submit New Booking (`create-booking.php`)](#5-php-endpoint-2-submit-new-booking-create-bookingphp)
6. [PHP Endpoint 3: Update Booking Status (`update-booking.php`)](#6-php-endpoint-3-update-booking-status-update-bookingphp)
7. [Database Setup (`schema.sql`)](#7-database-setup-schemasql)
8. [Apache `.htaccess` Security & Redirect Rules](#8-apache-htaccess-security--redirect-rules)
9. [Updating Frontend JavaScript (`fetch` calls)](#9-updating-frontend-javascript-fetch-calls)

---

## 1. Project Overview

The **Venue Booking Application** handles:
- Sending email notifications with PDF requisition attachments via `send-email.php`.
- Submitting venue booking requests via `create-booking.php`.
- Updating booking approval/rejection status via `update-booking.php`.
- Protecting application source code and DOM structure from inspect element and debugging tools.
- Standardizing all domain requests to `https://www.yourdomain.com`.

---

## 2. Domain Standardization (`www.` Redirects)

To enforce standardization, all HTTP and non-www requests automatically redirect to `https://www.yourdomain.com`.

### Client-Side JavaScript Enforcer (`components/InspectProtection.js`)
```javascript
if (typeof window !== 'undefined') {
  const host = window.location.hostname;
  const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host.includes('192.168.');
  
  if (!isLocalhost && !host.startsWith('www.')) {
    window.location.replace(`https://www.${host}${window.location.pathname}${window.location.search}`);
  }
}
```

---

## 3. Inspect Element & DevTools Protection

The frontend is shielded against unauthorized inspection, code modification, and developer tools debugging:

1. **Disabled Right-Click Context Menu**: Prevents opening "Inspect Element" via right-click mouse button.
2. **Blocked DevTools Shortcuts**:
   - `F12` key
   - `Ctrl + Shift + I` / `Cmd + Option + I` (Inspect)
   - `Ctrl + Shift + J` / `Cmd + Option + J` (Developer Console)
   - `Ctrl + Shift + C` / `Cmd + Option + C` (Element Selector)
   - `Ctrl + U` / `Cmd + Option + U` (View Source Code)
   - `Ctrl + S` / `Cmd + S` (Save Page)
3. **Anti-Debugger Loop**: Runs a high-priority background check that pauses execution if Developer Tools are opened.

---

## 4. PHP Endpoint 1: Email Notifications (`send-email.php`)

Save as: `api/send-email.php`

```php
<?php
/**
 * PHP Backend Endpoint: Send Email Notifications with Requisition PDF Attachment
 * Project: Venue Booking Application
 */

header("Access-Control-Allow-Origin: https://www.yourdomain.com"); 
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "code" => 405, "message" => "Method Not Allowed. Must use POST."]);
    exit();
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/vendor/autoload.php';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["status" => "error", "code" => 400, "message" => "Invalid JSON payload format."]);
    exit();
}

$toEmail   = filter_var($data['toEmail'] ?? '', FILTER_VALIDATE_EMAIL);
$status    = htmlspecialchars(strip_tags($data['status'] ?? ''));
$eventName = htmlspecialchars(strip_tags($data['eventName'] ?? ''));
$institute = htmlspecialchars(strip_tags($data['institute'] ?? ''));
$pdfBase64 = $data['pdfBase64'] ?? null;

if (!$toEmail || !$eventName || !$status) {
    http_response_code(400);
    echo json_encode(["status" => "error", "code" => 400, "message" => "Missing required parameters."]);
    exit();
}

$smtpUser = getenv('EMAIL_USER') ?: 'your-email@office365.com';
$smtpPass = getenv('EMAIL_PASS') ?: 'your-email-password';

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.office365.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtpUser;
    $mail->Password   = $smtpPass;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->setFrom($smtpUser, 'V - Booking Admin');
    $mail->addAddress($toEmail);

    $isApproved = ($status === 'approved');
    $mail->Subject = $isApproved 
        ? "✅ Approved: Venue Booking for {$eventName}"
        : "❌ Rejected: Venue Booking for {$eventName}";

    $mail->Body = $isApproved
        ? "Hello,\n\nYour venue booking request for \"{$eventName}\" at {$institute} has been APPROVED by the admin.\n\nPlease find your official requisition receipt attached.\n\nRegards,\nV - Booking Admin\nVidyalankar Institute"
        : "Hello,\n\nWe regret to inform you that your venue booking request for \"{$eventName}\" at {$institute} has been REJECTED.\n\nRegards,\nV - Booking Admin\nVidyalankar Institute";

    if ($isApproved && !empty($pdfBase64)) {
        if (strpos($pdfBase64, 'base64,') !== false) {
            $pdfBase64 = explode('base64,', $pdfBase64)[1];
        }
        $pdfBinary = base64_decode($pdfBase64);
        $cleanInst = preg_replace('/[^A-Za-z0-9_-]/', '_', $institute);
        $cleanEvt  = preg_replace('/[^A-Za-z0-9_-]/', '_', $eventName);
        $filename  = "{$cleanInst}_Requisition_{$cleanEvt}.pdf";

        $mail->addStringAttachment($pdfBinary, $filename, 'base64', 'application/pdf');
    }

    $mail->send();
    http_response_code(200);
    echo json_encode(["status" => "success", "code" => 200, "message" => "Email sent to {$toEmail}."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "code" => 500, "message" => "Email dispatch failed.", "details" => $mail->ErrorInfo]);
}
?>
```

---

## 5. PHP Endpoint 2: Submit New Booking (`create-booking.php`)

Save as: `api/create-booking.php`

```php
<?php
header("Access-Control-Allow-Origin: https://www.yourdomain.com");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "code" => 405, "message" => "Method Not Allowed"]);
    exit();
}

$dbHost = getenv('DB_HOST') ?: 'localhost';
$dbName = getenv('DB_NAME') ?: 'venue_booking_db';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') ?: '';

$pdo = new PDO("mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
]);

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['event_name']) || empty($data['user_email'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "code" => 400, "message" => "Required parameters missing."]);
    exit();
}

$id          = $data['id'] ?? ('vdt-req-' . substr(time(), -6));
$user_id     = htmlspecialchars(strip_tags($data['user_id'] ?? ''));
$user_email  = filter_var($data['user_email'], FILTER_VALIDATE_EMAIL);
$event_name  = htmlspecialchars(strip_tags($data['event_name']));
$institute  = htmlspecialchars(strip_tags($data['institute'] ?? ''));
$coordinator = htmlspecialchars(strip_tags($data['coordinator'] ?? ''));
$venue       = htmlspecialchars(strip_tags($data['venue'] ?? ''));
$start_time  = $data['start_time'] ?? date('Y-m-d H:i:s');
$end_time    = $data['end_time'] ?? date('Y-m-d H:i:s');
$attendees   = htmlspecialchars(strip_tags($data['attendees'] ?? ''));
$external    = htmlspecialchars(strip_tags($data['external_participants'] ?? 'No'));
$items       = json_encode($data['items'] ?? []);
$signature   = $data['signature_url'] ?? '';

$stmt = $pdo->prepare("
    INSERT INTO bookings 
    (id, user_id, user_email, event_name, institute, coordinator, venue, start_time, end_time, attendees, external_participants, items, signature_url, status, created_at)
    VALUES 
    (:id, :user_id, :user_email, :event_name, :institute, :coordinator, :venue, :start_time, :end_time, :attendees, :external, :items, :signature, 'pending', NOW())
");

$stmt->execute([
    ':id' => $id, ':user_id' => $user_id, ':user_email' => $user_email, ':event_name' => $event_name,
    ':institute' => $institute, ':coordinator' => $coordinator, ':venue' => $venue,
    ':start_time' => $start_time, ':end_time' => $end_time, ':attendees' => $attendees,
    ':external' => $external, ':items' => $items, ':signature' => $signature
]);

echo json_encode(["status" => "success", "code" => 201, "id" => $id, "message" => "Booking created."]);
?>
```

---

## 6. PHP Endpoint 3: Update Booking Status (`update-booking.php`)

Save as: `api/update-booking.php`

```php
<?php
header("Access-Control-Allow-Origin: https://www.yourdomain.com");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(); }

$pdo = new PDO("mysql:host=localhost;dbname=venue_booking_db;charset=utf8mb4", "root", "", [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
]);

$data = json_decode(file_get_contents('php://input'), true);
$id     = $data['id'] ?? null;
$status = $data['status'] ?? null;

if (!$id || !$status) {
    http_response_code(400);
    echo json_encode(["status" => "error", "code" => 400, "message" => "ID and status required."]);
    exit();
}

$stmt = $pdo->prepare("UPDATE bookings SET status = :status, admin_signature_url = :sig, approved_at = NOW() WHERE id = :id");
$stmt->execute([':status' => $status, ':sig' => $data['admin_signature_url'] ?? null, ':id' => $id]);

echo json_encode(["status" => "success", "code" => 200, "message" => "Status updated."]);
?>
```

---

## 7. Database Setup (`schema.sql`)

```sql
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(128),
    user_email VARCHAR(255) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    institute VARCHAR(255),
    coordinator VARCHAR(255),
    venue VARCHAR(255),
    start_time DATETIME,
    end_time DATETIME,
    attendees VARCHAR(255),
    external_participants VARCHAR(255),
    items JSON,
    signature_url LONGTEXT,
    admin_signature_url LONGTEXT,
    status VARCHAR(32) DEFAULT 'pending',
    created_at DATETIME,
    approved_at DATETIME
);
```

---

## 8. Apache `.htaccess` Security & Redirect Rules

Save in your web root as `.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On

    # Force HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # Force www. Domain Standardization
    RewriteCond %{HTTP_HOST} !^www\. [NC]
    RewriteCond %{HTTP_HOST} !^localhost [NC]
    RewriteCond %{HTTP_HOST} !^127\.0\.0\.1 [NC]
    RewriteRule ^ https://www.%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Security Headers (Inspect Element & Clickjacking Protection)
<IfModule mod_headers.c>
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';"
</IfModule>

# Disable Directory Index Browsing
Options -Indexes

# Restrict Access to Configs and Env Files
<FilesMatch "\.(env|json|config|log|md|sql|sh|lock)$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

---

## 9. Updating Frontend JavaScript (`fetch` calls)

### Standardized `fetch` Call Example:

```javascript
const sendEmailNotification = async (booking, status, pdfBase64 = null) => {
  try {
    const response = await fetch('https://www.yourdomain.com/api/send-email.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toEmail: booking.user_email,
        status: status,
        eventName: booking.event_name,
        institute: booking.institute,
        pdfBase64: pdfBase64
      })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message);
    console.log("✅ Response:", result);
  } catch (err) {
    console.error("❌ Request Error:", err);
  }
};
```
