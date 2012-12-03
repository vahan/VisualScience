<?php
header('Content-type: text/csv');
header('Content-Disposition: attachement;filename=livingscience_'.time().'.csv');
$newLineCharacter = $_GET['char'];
// Fix for crappy IE bug in download.
header('Pragma: ');
header('Cache-Control: ');
$text = $_GET['text'];
$text = str_replace(''.$newLineCharacter, "\r\n", $text);
echo htmlspecialchars($text);
?>