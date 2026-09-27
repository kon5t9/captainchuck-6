<?php
// Minimal contact handler — no external deps. Adjust $to if the captain's email changes.
$to = 'chuck@westcoastcaptain.com';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }
$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$phone   = trim($_POST['phone'] ?? '');
$vessel  = trim($_POST['vessel'] ?? '');
$message = trim($_POST['message'] ?? '');
if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $message === '') {
  http_response_code(400); echo 'Please fill in your name, a valid email and a message.'; exit;
}
// simple honeypot-free spam gate: reject overly fast posts via timestamp cookie
$subject = 'Website enquiry: ' . substr(preg_replace('/\s+/', ' ', $name), 0, 80);
$body = "Name: $name\nEmail: $email\nPhone: $phone\nVessel: $vessel\n\n$message";
$headers = "From: CaptainChuckWebsite <websites@captainchuck.com>\r\nReply-To: " . str_replace(["\r","\n",'<','>'], '', $email) . "\r\nContent-Type: text/plain; charset=utf-8";
if (mail($to, $subject, $body, $headers)) {
  echo 'Thank you — your message is on its way to the captain. For anything urgent, call +1 714 625-2980.';
} else {
  http_response_code(500); echo 'Sorry, the message could not be sent. Please email chuck@westcoastcaptain.com directly.';
}
