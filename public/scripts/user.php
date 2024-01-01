<?php





function addUser($username, $password) {
    // Connect to the PostgreSQL server
    $connection = pg_connect("host=199.87.136.158 port=5432 dbname=satsgpt_users user=sgpt password=@2j;jkjkl;");

    $id = md5($username.$password);

    // Insert a row
    $query = "INSERT INTO satsgpt_users (id) VALUEs ('$id');";
    pg_query($connection, $query);

    // echo json_encode({'test': 'complete'});
    // // Update a row
    // // $query = "UPDATE users SET name='Jane Doe' WHERE email='john.doe@example.com'";
    // // pg_query($connection, $query);

    // Read a row
    $query = "SELECT * FROM users WHERE id=$id";
    $result = pg_query($connection, $query);
    $row = pg_fetch_assoc($result);
    echo $row;

    // // Delete a row
    // $query = "DELETE FROM users WHERE id=$id";
    // pg_query($connection, $query);

    // // Close the connection
    // pg_close($connection);
}




// Function request handler

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    
    // Get the text from the javascript request body
    $request_body = trim(file_get_contents('php://input'));
    $data = json_decode($request_body, true);
    $mode = $data['mode'];

    // create user
    if ($mode == 0) {

        $username = $data['username'];
        $password = $data['password'];
        addUser($username, $password);

    // delete user
    } else if ($mode == 1) {
        $username = $data['username'];
        $password = $data['password'];
        deleteUser($username, $password);

    } else {
        echo "big problem";
    }
}