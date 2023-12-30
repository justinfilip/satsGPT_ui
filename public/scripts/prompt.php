<?php

header('Content-Length: '.$filesize);
header("Content-Range: 0-".($filesize-1)."/".$filesize);

function getTokens($prompt_id, $last_token, $server_mode) {

    $url = 'https://www.satsgpt.xyz:9090/sgptprompt';

    $data = array(
        'prompt_id' => $prompt_id,
        'last_token' => $last_token,
        'server_mode' => $server_mode
    );

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

function sendPrompt($prompt, $server_mode) {

    $prompt_id = randHash(50);

    // The URL to which the request is sent
    $url = 'https://www.satsgpt.xyz:9090/sgptprompt';

    // The data to send via POST
    $data = [
        'prompt' => $prompt,
        'prompt_id' => $prompt_id,
        'server_mode' => $server_mode
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

function deleteInferenceTask($prompt_id, $last_token) {

    $url = 'https://www.satsgpt.xyz:9090/sgptkilltask';
    $data = [
        'prompt_id' => $prompt_id,
        'last_token' => $last_token
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
    
    // The prompt was successfully sent to this PHP function, which called the server, got a response, and sent it back to the javascript function that called it.

}

// Function request handler

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    
    // Get the text from the javascript request body
    $request_body = trim(file_get_contents('php://input'));
    $data = json_decode($request_body, true);
    $post_mode = $data['mode'];

    if ($post_mode == 0) {
        $server_mode = 0;
        $prompt = $data['prompt'];
        sendPrompt($prompt, $server_mode);
    } else if ($post_mode == 1) {
        $prompt_id = $data['prompt_id'];
        $last_token = $data['last_token'];
        deleteInferenceTask($prompt_id, $last_token);
    } else {
        echo "big problem";
    }
}

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    
    $prompt_id = $_GET['prompt_id'];
    $last_token = $_GET['last_token'];
    $server_mode = 1;
    getTokens($prompt_id, $last_token, $server_mode);
}

// Auxiallary functions

function randHash($len=32)
{
	return substr(md5(openssl_random_pseudo_bytes(20)),-$len);
}
