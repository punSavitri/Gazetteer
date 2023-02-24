<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$result = file_get_contents('countryBorders.geo.json');

$decode = json_decode($result, true);

for ($i = 0; $i < count($decode['features']); $i++) {

  $gemo = $decode['features'][$i]['gemotry'];
  $coordinates = $gemo . ['coordinates'][0];
};

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

$output['data'] = $decode['features'];

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);
