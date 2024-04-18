<?php

// My API-Key for NASA-API's, allows 1000 requests per hour
$APIKEY = "rmsgrut06P1ocvxUfIiMaB5sMgn67s7YxfLcPbhs";

// Lists of exisiting cameras on both mars rovers
$CAMERA_LIST_PERSEVERANCE = array("EDL_RUCAM", "EDL_RDCAM", "EDL_DDCAM", "EDL_PUCAM1", "EDL_PUCAM2", "NAVCAM_LEFT",
    "NAVCAM_RIGHT", "MCZ_RIGHT", "MCZ_LEFT", "FRONT_HAZCAM_LEFT_A", "FRONT_HAZCAM_RIGHT_A", "REAR_HAZCAM_LEFT",
    "REAR_HAZCAM_RIGHT", "SKYCAM", "SHERLOC_WATSON");
$CAMERA_LIST_CURIOSITY = array("FHAZ", "RHAZ", "MAST", "CHEMCAM", "MAHILI", "MARDI", "NAVCAM");

// read fetch request from client
$data = json_decode(file_get_contents("php://input"), true);
$isPerseveranceRover = $data["isPerseveranceRover"];
$isCuriosityRover = $data["isCuriosityRover"];
$date = $data["date"];
$camera = $data["camera"];

// Validate user form input
validation($isCuriosityRover, $isPerseveranceRover, $date, $camera, $CAMERA_LIST_CURIOSITY, $CAMERA_LIST_PERSEVERANCE);

$url = getUrl($isPerseveranceRover, $camera, $date, $APIKEY);

// GET request to NASA Mars Rover API
$curl = curl_init($url);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_HTTPGET, true);
$response_json = curl_exec($curl);
curl_close($curl);

$responseData = json_decode($response_json, true);

// save important part of answer of the get request in response array
$numberOfPhotos = sizeof($responseData["photos"]);
$responseArray = [];
$responseArray["numberOfPhotosAtDate"] = $numberOfPhotos;
// handle cookie, invalid requests are not counted (function is called after validation)
$numberOfRequests = setNumberOfRequestsCookie();

// only if a photo was actually found
if ($numberOfPhotos > 0) {
    $firstPhoto = $responseData["photos"][0];
    $responseArray["roverStatus"] = $firstPhoto["rover"]["status"];
    $responseArray["roverTotalPhotos"] = $firstPhoto["rover"]["total_photos"];
    $responseArray["roverImgSrc"] = $firstPhoto["img_src"];
    $responseArray["requestCount"] = $numberOfRequests; // request_count hold
}

// answer
echo json_encode($responseArray);

function setNumberOfRequestsCookie()
{
    $numberOfRequests = 1;
    if (isset($_COOKIE["request_count"])) {
        $numberOfRequests = $_COOKIE["request_count"] + 1;
    }
    setcookie("request_count", $numberOfRequests, time() + 60 * 60 * 24 * 30);
    return $numberOfRequests;
}

// Validate that date has a valid format, is converted to format: "Y-m-d" by JS code if valid
function validateDate($date, $format = 'Y-m-d'): bool
{
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d -> format($format) == $date;
}

function validation($isCuriosityRover, $isPerseveranceRover, $date, $camera, array $CAMERA_LIST_CURIOSITY, array $CAMERA_LIST_PERSEVERANCE)
{
    if (($isCuriosityRover and $isPerseveranceRover) or (!$isCuriosityRover and !$isPerseveranceRover)) {
        die("Error: either the curiosity or perseverance rover must be selected");
    }
    if (!validateDate($date)) {
        die("Error: invalid date");
    }
    if ($isCuriosityRover && $camera != "" && !in_array($camera, $CAMERA_LIST_CURIOSITY)) {
        die("Error: this is not a valid camera for the curiosity rover");
    }
    if ($isPerseveranceRover && $camera != "" && !in_array($camera, $CAMERA_LIST_PERSEVERANCE)) {
        die("Error: this is not a valid camera for the curiosity rover");
    }
}

// determine and set correct api url
function getUrl($isPerseveranceRover, $camera, $date, string $APIKEY): string
{
    if ($isPerseveranceRover) {
        if (isset($camera) && $camera != "") {
            $url = 'https://api.nasa.gov/mars-photos/api/v1/rovers/' . 'perseverance' . '/photos?earth_date=' . $date . '&camera=' . $camera . '&api_key=' . $APIKEY;
        } else {
            $url = 'https://api.nasa.gov/mars-photos/api/v1/rovers/' . 'perseverance' . '/photos?earth_date=' . $date . '&api_key=' . $APIKEY;
        }
    } else {
        if (isset($camera) && $camera != "") {
            $url = 'https://api.nasa.gov/mars-photos/api/v1/rovers/' . 'curiosity' . '/photos?earth_date=' . $date . '&camera=' . $camera . '&api_key=' . $APIKEY;
        } else {
            $url = 'https://api.nasa.gov/mars-photos/api/v1/rovers/' . 'curiosity' . '/photos?earth_date=' . $date . '&api_key=' . $APIKEY;
        }
    }
    return $url;
}