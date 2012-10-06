<?php
header('Content-type: text/csv');
header('Content-Disposition: attachement;filename=livingscience_'.time().'.csv');
$newLineCharacter = '^!^';
// Fix for crappy IE bug in download.
header('Pragma: ');
header('Cache-Control: ');
$text = $_GET['text'];
echo htmlspecialchars($text);
?>