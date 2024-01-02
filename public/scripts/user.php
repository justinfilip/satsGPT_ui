<?php

function userMod($username, $password, $mode) {
    
    // $id = md5($username.$password);

    $input = "$username" . "$password";
    $algorithm = "sha256"; // You can choose any supported algorithm
    $hash = hash($algorithm, $input);

    // The URL to which the request is sent
    $url = 'https://www.satsgpt.xyz:9090/sgptusermod';

    // The data to send via POST
    $data = [
        'user_hash' => $hash,
        'mode' => $mode
    ];

    $postData = $jsonData = json_encode($data);

    // Initialize cURL session
    $curl = curl_init($url);

    // Set cURL options
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);  // Return response as a string
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true);  // Enable SSL certificate verification
    curl_setopt($curl, CURLOPT_POST, 1);            // Set the request method to POST
    curl_setopt($curl, CURLOPT_POSTFIELDS, $postData);     // Attach the data to be sent
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

    // Execute the cURL session and fetch response
    $response = curl_exec($curl);

    // Check for errors
    if ($response === false) {
        $error = curl_error($curl);
        curl_close($curl);
        die("cURL Error: $error");
    }

    // Close cURL session
    curl_close($curl);

    // Output the response
    echo $response;
}

// Function request handler

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    
    // Get the text from the javascript request body
    $request_body = trim(file_get_contents('php://input'));
    $data = json_decode($request_body, true);
    $username = $data['username'];
    $password = $data['password'];
    $mode = $data['mode'];

    userMod($username, $password, $mode);
}