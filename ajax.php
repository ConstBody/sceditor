<?php

require_once 'GetSmileys.php';
require_once 'ParseBBCode.php';

$bbCode = $_POST['bbCode'];
$html = Forum_Api_ParseBBCOde::getInstance()
    ->parseBBCode($bbCode);
//$html = preg_replace("/\\\'/", "'", addslashes($html));
//exit('{"html": "' . $html . '"}');
exit( json_encode( array('html' => $html) ) );
