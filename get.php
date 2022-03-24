<?php

$asn = $_GET["asn"];

function getUrl($url)
{
    $content = file_get_contents($url);
    return array(
        "headers" => $http_response_header,
        "content" => $content
    );
}

$response = getUrl("https://rest.db.ripe.net/search.json?query-string={$asn}&inverse-attribute=origin&type-filter=route&flags=no-referenced&flags=no-irt&source=RIPE");
if ($response["content"] === FALSE) {
    echo $response["headers"][0];
    header($response["headers"][0]);
} else {
    echo $response["content"];
}
