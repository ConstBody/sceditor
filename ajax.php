<?php

require_once 'ParseBBCode.php';

$bbCode = $_POST['bbCode'];
$html = Forum_Api_ParseBBCOde::getInstance()
    ->parseBBCode($bbCode);
exit('{"html": "' . addslashes($html). '"}');