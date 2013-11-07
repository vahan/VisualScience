<?php
/**
 * @file
 * Receives a string through GET request and outputs a CSV file out if it.
 */
header('Content-type: text/csv');
header('Content-Disposition: attachement;filename=livingscience_' . time() . '.csv');
$new_line_character = urldecode($_GET['char']);
// Fix for crappy IE bug in download.
header('Pragma: ');
header('Cache-Control: ');
$text = urldecode($_GET['text']);
$text = str_replace($new_line_character, "\r\n", $text);
echo htmlspecialchars($text);