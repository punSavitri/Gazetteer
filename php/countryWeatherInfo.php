<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$api_url = 'https://api.openweathermap.org/data/2.5/weather?q=' . $_REQUEST['city'] . ',' . $_REQUEST['country'] . '&lang=en&units=metric&appid=5b565b9df0c73c61b9800cce1a0e8af7';

$ch = curl_init();

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $api_url);

$result = curl_exec($ch);

curl_close($ch);

$weatherArray = json_decode($result, true);
// print_r($weatherArray);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $weatherArray['weather'];

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);
