<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$asn = $_GET["asn"];
$get = file_get_contents("https://rest.db.ripe.net/search.json?query-string={$asn}&inverse-attribute=origin&type-filter=route&flags=no-referenced&flags=no-irt&source=RIPE");
echo $get;
?>