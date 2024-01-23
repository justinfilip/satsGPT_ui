// use cookie to store the user and wether the user has agreed to the terms
// if no user hash key cookie available, sign the user up
// if no cookie for user terms, check database if user is agreed to terms

// ^ IF User is compliant
// Load the interface and prompt focus:

// # Both of the following to be created in JS/PHP at user sign up
// # user_id= message.get('user_id') # Bitcoin/lightning address
// # password = message.get('password')

//

// Load the interface

//

const history_container = document.getElementById("history_window");
const text_input = document.getElementById("text_input");
const prompt_page = document.getElementById("promptpage");
const navbar = document.getElementById("navbar");
const navbuttons = navbar.children;
const prompt_actions = document.getElementById("prompt_actions");
const keys_toggle = document.getElementById("keys_toggle");
const send_button = document.getElementById("text_input_send_button");
const send_tip = document.getElementById("send_tip");
var promptable = 1;
var display_mode = "";
var display_mode_cookie = readCookie('display_mode');

if (display_mode_cookie == null) {
    display_mode = "light_";
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        dlToggle(0);
    }

} else {
    display_mode = display_mode_cookie;
    dlToggle(1);

}

for(i=0;i<navbuttons.length;i++) {
    
    navbuttons[i].addEventListener('pointerdown', function(e) {
        var selectednavbuttons = document.getElementsByClassName(display_mode + 'navbuttonselected');
        var activepages = document.getElementsByClassName('activepage');
        var targetpage = e.target.getAttribute('targetpage');

        if(text_input.innerText.length < 1) {
            text_input.innerHTML = '<i id="placeholder">Write your prompt here</i>';
        }

        for(i=0;i<selectednavbuttons.length;i++) {
            selectednavbuttons[i].className = display_mode + 'navbutton';
            activepages[i].className = 'hidden';
        }

        if (targetpage == "promptpage") {
            text_input.className = display_mode + "text-input";
            prompt_actions.className = display_mode + "prompt-actions";
            keys_toggle.className = "keys-toggle-open";
            send_button.className = "text-input-send-button";
            send_tip.className = "send-tooltip";
            
        } else {
            text_input.className = "hidden";
            prompt_actions.className = "hidden";
            keys_toggle.className = "hidden";
            send_button.className = "hidden";
            send_tip.className = "hidden";
        }

        e.target.className = display_mode + 'navbuttonselected';
        document.getElementById(targetpage).className = 'activepage';
    });

}

document.getElementById('promptbutton').className = display_mode + 'navbuttonselected';
document.getElementById('promptpage').className = 'activepage';

text_input.innerHTML = '<i id="placeholder">Write your prompt here</i>';
text_input.className = display_mode + "text-input";

text_input.addEventListener('focusout', async function(e) {
    if(text_input.innerHTML.length < 1) {
        text_input.innerHTML = '<i id="placeholder">Write your prompt here</i>';
    }
});

text_input.addEventListener('blur', async function(e) {
    if(text_input.innerHTML.length < 1) {
        text_input.innerHTML = '<i id="placeholder">Write your prompt here</i>';
    }
});

text_input.addEventListener('onfocus', async function(e) {
    if(text_input.innerHTML == '<i id="placeholder">Write your prompt here</i>') {
        text_input.innerText = "";
    }
});

text_input.addEventListener('click', async function(e) {

    if(text_input.innerHTML == '<i id="placeholder">Write your prompt here</i>') {
        text_input.innerText = "";
    }
});

window.addEventListener('focus', async function(e) {
    if(text_input.innerHTML == '<i id="placeholder">Write your prompt here</i>') {
        text_input.innerText = "";
    }
});

// dark mode toggle

const dark_light_toggle = document.getElementById('light-dark-toggle');
const body_element = document.getElementById("main-body");
const pages_num = 3;

function dlToggle(mode) {

    var satsGPT_logo = document.getElementById(display_mode + "satsGPT");
    if (mode === 0) {
        // cycling themes
        if (display_mode === 'light_') {
            display_mode = 'dark_';
        } else if (display_mode === 'dark_') {
            display_mode = 'light_';
        } else {
            console.log("shouldn't be here");
        }
        
        setCookie('display_mode', display_mode, "");
    }

    var alternate_satsGPT_logo = document.getElementById(display_mode + "satsGPT");
    satsGPT_logo.className = "satsGPT-invisible";
    alternate_satsGPT_logo.className = "satsGPT";

    var themed_elements = document.querySelectorAll('[class*="_"]');

    for (i=0;i<themed_elements.length;i++) {
        themed_elements[i].className = display_mode + themed_elements[i].className.split("_")[1];
    }

    setTimeout(function(e) {
        toggled = 0
    }, 500)
}

var toggled = 0

dark_light_toggle.addEventListener('pointerdown', function(e) {

    if (toggled !== 1) {
        toggled = 1
        dlToggle(0);
    }
});

dark_light_toggle.addEventListener('pointerdown', function(e) {

    if (toggled !== 1) {
        toggled = 1
        dlToggle(0);
    }
});

// Get token completions from the inference server:

async function getTokens(prompt_id, last_token) {
    // Use fetch to send the text to the PHP function
    fetch('scripts/prompt.php?prompt_id=' + prompt_id + '&last_token=' + last_token.toString(), {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {

        last_token = data[prompt_id][1]

        if (data[prompt_id][0] === 1) {

            try {
                token_payload = data[prompt_id][2];
            
                if (token_payload == "") {
                    console.log("waiting");
                    setTimeout(function(){
                        getTokens(prompt_id, last_token);
                    }, 1000);
                } else {
                    document.getElementById(prompt_id).innerText += ' ' + token_payload;
                    
                    setTimeout(function(){
                        getTokens(prompt_id, last_token);
                    }, 350);
                }
            } catch {
                // Element was likely deleted by user canceling inference task
                return
            }
            
        } else if (data[prompt_id][0] === 0) {

            try {
                document.getElementById(prompt_id).innerText += ' ' + data[prompt_id][2];
                promptable = 1;
                send_button.className = "text-input-send-button";

            } catch {
                // Element was likely deleted by user canceling inference task
                return
            }
            
            setTimeout(function (e) {
                document.getElementById("prompt_" + prompt_id).className = display_mode + "history-prompt-element";
                document.getElementById("action_" + prompt_id).className = display_mode + "history-prompt-element-cancel-button-hidden";
            }, 1000);
            return

        } else {
            console.log("You shouldn't be here.. GO. RUN. Tell SOMEBODY.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Send the user's prompt to the PHP function that calls the inference server:

async function sendPrompt(prompt) {

    text_input.innerHTML = "";
    var request_body = {
        prompt: prompt,
        mode: 0
    }

    // Send the text to the PHP GET function
    fetch('scripts/prompt.php', {
        method: 'POST',
        body: JSON.stringify(request_body)
    })
    .then(response => response.json())
    .then(data => {
        // Once the PHP function has completed, do something with the returned string

        //
        //
        // Enable the log here to get PHP to dump errors to the console
        //
        //

        // console.log(data);
        // data = JSON.parse(data);

        //
        //
        // Enable the log here to get PHP to dump errors to the console
        //
        //
        
        // The prompt was successfully submitted and returned valid JSON containing
        // {"prompt_id": prompt_id, "next_token": 1}
        if (data['next_token'] === 1) {
            var prompt_id = data['prompt_id'];

            var history_element = document.createElement('div');
            history_element.className = display_mode + "history-prompt-element-loading";
            history_element.innerText = prompt;
            history_element.id = "prompt_" + prompt_id

            var history_actions = document.createElement('div');
            history_actions.className = "history-prompt-element-actions";

            var history_action_button = document.createElement('div');
            history_action_button.className = "history-prompt-element-cancel-button";
            history_action_button.id = "action_" + prompt_id

            history_action_button.addEventListener('pointerdown', function(e) {
                e.target.className = "history-prompt-element-cancel-button-selected";
                var prompt_id = e.target.parentElement.parentElement.id.split("_")[1];
                setTimeout(function() {
                    var prompt_history_element_to_delete = document.getElementById("prompt_" + prompt_id);
                    if (prompt_history_element_to_delete.className === display_mode + "history-prompt-element-loading") {
                        // call server to cancel inference task for prompt_id
                        
                        var request_body = {
                            prompt_id: prompt_id,
                            mode: 1,
                        }
    
                        fetch('scripts/prompt.php', {
                            method: 'POST',
                            body: JSON.stringify(request_body)
                        })
                        .then(response => response.json())
                        .then(data => {
                            // Once the PHP function has completed, do something with the returned string
                    
                            //
                            //
                            // Enable the log here to get PHP to dump errors to the console
                            //
                            //
                    
                            // console.log(data);
                            // data = JSON.parse(data);
                            
                            task_deleted = data[prompt_id][0];
    
                            if (task_deleted === 1) {
                                prompt_history_element_to_delete.remove();
                                document.getElementById(prompt_id).remove();
                            } else {
                                // failed, maybe retry
                                console.log("do this later");
                            }
                            
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                    }
                }, 100);
            });

            history_actions.append(history_action_button);
            history_element.append(history_actions);
            history_container.append(history_element);

            var created_history_prompt_element = document.getElementById("prompt_" + prompt_id);
            const y = created_history_prompt_element.getBoundingClientRect().top + window.scrollY - 100;

            window.scrollTo({top: y, behavior: 'smooth'});

            createNewHistoryElement(prompt_id);

            var last_token = 0;
            
            setTimeout(function (e) {
                getTokens(prompt_id, last_token);
            }, 2000);

        } else {
            text_input.innerText = "What do you think?";
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Sending prompts

// Make sure the user's prompt is formatted properly:
// var promptable = 0
async function validateSendPrompt(send_button, prompt) {

    if (promptable == 1) {
        
        if(readCookie("id") == null || prompt.length < 5 || text_input.innerHTML == '<i id="placeholder">Write your prompt here</i>') {
            send_button.className = "text-input-send-button-rejected";
            setTimeout(function (e) {
                send_button.className = "text-input-send-button";
            }, 300);
            // Let the user know the prompt isn't long enough
            return
    
        } else {
            promptable = 0;
            send_button.className = "text-input-send-button-selected";
            // setTimeout(function (e) {
            //     send_button.className = "text-input-send-button";
            // }, 300);
            sendPrompt(prompt);
        }
    }
    
}

// Send button to send

send_button.addEventListener('pointerdown', async function(e) {

    var prompt = text_input.innerText;
    // text_input.className = display_mode + "text-input-closed";
    // text_input_open = 0;
    validateSendPrompt(send_button, prompt);

});

// Shift key & Enter while focused on the span element (text_input) to send prompt:

text_input.addEventListener('keyup', function(e) {
    // Shift key & Enter being pressed

    if (e.shiftKey && e.key === 'Enter') { // && busy === 0

        if (isMobile()) {
            return
        }
        e.preventDefault();
        var prompt = text_input.innerText
        validateSendPrompt(send_button, prompt);
    }
});

text_input.addEventListener('keypress', function(e) {

    // Shift key & Enter being pressed
    if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
    }
});




var text_input_open = 1

keys_toggle.addEventListener('pointerdown', function(e) {
    // event listener for open/close input
    
    if (text_input_open == 0) {
        text_input_open = 1;
        keys_toggle.className = "keys-toggle-open";
        text_input.className = display_mode + "text-input";
    } else {
        text_input_open = 0;
        keys_toggle.className = "keys-toggle-close";
        text_input.className = display_mode + "text-input-closed";
    }
});

// Auxillary functions:

function readCookie(name) {
        
    return (name = new RegExp('(?:^|;\\s*)' + ('' + name).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '=([^;]*)').exec(document.cookie)) && name[1];

}

function setCookie(name, value, optional_expiry) {
    document.cookie = name + "=" + value + optional_expiry;
}

function deleteCookie(name) {
    document.cookie = name + '=; Max-Age=0'
}

async function createNewHistoryElement(prompt_id) {
    var history_element = document.createElement('div');
    history_element.id = prompt_id;
    history_element.className = display_mode + "history-tokens-element";
    history_container.append(history_element);
}

function isMobile() {
    var match = window.matchMedia || window.msMatchMedia;
    if(match) {
        var mq = match("(pointer:coarse)");
        return mq.matches;
    }
    return false;
}

async function userMod(username, password, mode, error_div) {

    var request_body = {
        username: username,
        password: password,
        // 0 = create user, 1 = delete user
        mode: mode,
        // 0 = userMod
        // 1 = getUser
        server_mode: 0
    }

    fetch('scripts/user.php', {
        method: 'POST',
        body: JSON.stringify(request_body)
    })
    .then(response => response.text()) //.json()
    .then(data => {
    
        console.log(data);
        data = JSON.parse(data);

        // 'id' is a unique key that is to be used for making prompt requests, it is separate from the username and password
        returned_id  = data['id'];

        if(returned_id === -1) {
            
            // sign in failed
            error_div.innerHTML = "Sign in failed, please try again later";

        } else if(returned_id === -2) {

            // username not available
            error_div.innerHTML = "Username is not available";

        } else if(returned_id === -3) {

            // username invalid at the server end, how did you get here??
            error_div.innerHTML = "You shouldn't be here, call someone";

        } else {
            setCookie('id', returned_id, "; max-age=2592000;");
            // setCookie('ba', data['r_hash'], "; max-age=2592000;");
            error_div.innerHTML = "Authentication successful";
            setTimeout(function(e) {window.location.reload();}, 3000);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

async function getUser(user_id) {
    var request_body = {
        user_id: user_id,
        // 0 = userMod
        // 1 = getUser
        server_mode: 1
    }

    fetch('scripts/user.php', {
        method: 'POST',
        body: JSON.stringify(request_body)
    })
    .then(response => response.text()) //.json()
    .then(data => {
    
        console.log(data);
        data = JSON.parse(data);
        // console.log(data);

        // 'id' is a unique key that is to be used for making API requests, it is separate from the username and password
        // returned_id  = data['user_id'];
        // // wether or not the subscription is active
        // sub_status = data['sub_status'];
        // r_hash = data['r_hash'];
        // expiry_time = data['expiry_time']; // in datetime
        
        // if(sub_status === false) {
        //     // present payment screen
            
        // }

        // populate account page

        // username
        // account created
        // subscription status
        // subscription expiration
        // change password
        // delete account

        // 


        returned_id  = data['user_id'];
        // // wether or not the subscription is active
        // // r_hash = user_payload['r_hash'];
        expiry_time = data['expiry_time']; // in datetime
        console.log(expiry_time)

        // user subscription expired or user just created, present payment screen
        // user expire time < current time
        if (expiry_time <= Date.now()) {
            console.log(Date.now())

            collectUserPayment(returned_id);
        }

    })
    .catch(error => {
        console.error('Error:', error);
    });
}


function collectUserPayment(returned_id) {
    const prompt_button = document.getElementById("promptbutton");
    prompt_button.className = display_mode + 'navbuttondisabled';
    prompt_button.removeEventListener('pointerdown', function(e){});
    promptable = 0;

    // load sign up/in page
    var nav_buttons = document.getElementsByClassName(display_mode + "navbutton");
    
    document.getElementById("accountbutton").className = display_mode + 'navbuttonselected';
    document.getElementById("promptpage").className = "hidden";
    text_input.className = "hidden";
    prompt_actions.className = "hidden";
    keys_toggle.className = "hidden";
    send_button.className = "hidden";
    send_tip.className = "hidden";

    document.getElementById("accountpage").innerHTML = "fjdskljf;kldsajfl;dsaj";
    document.getElementById("accountpage").className = "activepage";


    var request_body = {
        user_id: returned_id,
        server_mode: 0 // 0 = get invoice, 1 = check address
    }

    fetch('scripts/payment.php', {
        method: 'POST',
        body: JSON.stringify(request_body)
    })
    .then(response => response.text()) //.json()
    .then(data => {
    
        console.log(data);
        data = JSON.parse(data);

        // get payment_request from response
        let payment_request = data['payment_request'];
        console.log("Payment request: " + payment_request);

        setTimeout(checkInvoice(returned_id), 1000);

    })
    .catch(error => {
        console.error('Error:', error);
    });



    function checkInvoice(user_id) {
        var request_body = {
            user_id: user_id,
            server_mode: 1 // 0 = get invoice, 1 = check address
        }
    
        fetch('scripts/payment.php', {
            method: 'POST',
            body: JSON.stringify(request_body)
        })
        .then(response => response.text()) //.json()
        .then(data => {
        
            console.log(data);
            data = JSON.parse(data);
    
            // if response contains confirmed payment (expiry time > now by whatever)
            // reload interface with expiry time cookie
            
            // else

            setTimeout(checkInvoice(returned_id), 1000);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }





}

//

// Validate user

//

if (readCookie("id") == null) {

    const prompt_button = document.getElementById("promptbutton");
    prompt_button.className = display_mode + 'navbuttondisabled';
    prompt_button.removeEventListener('pointerdown', function(e){});
    promptable = 0;

    // load sign up/in page
    var nav_buttons = document.getElementsByClassName(display_mode + "navbutton");
    
    document.getElementById("accountbutton").className = display_mode + 'navbuttonselected';
    document.getElementById("promptpage").className = "hidden";
    text_input.className = "hidden";
    prompt_actions.className = "hidden";
    keys_toggle.className = "hidden";
    send_button.className = "hidden";
    send_tip.className = "hidden";

    document.getElementById("accountpage").className = "activepage";
    document.getElementById("account-details").className = "hidden";
    document.getElementById("account-auth").className = "account-auth";
    
} else {

    // Continue as normal

    // check user information and populate account page
    getUser(readCookie('id'));

}


const sign_up_button = document.getElementById("sign-up-button");
const sign_in_button = document.getElementById("sign-in-button");
const username_field = document.getElementById("username-field");
const password_field = document.getElementById("password-field");
const confirm_password_field = document.getElementById("confirm-password-field");
const submit_auth_button = document.getElementById("auth-submit-button");


sign_up_button.addEventListener('click', function(e) {
    sign_in_button.className = "auth-mode-button";
    sign_up_button.className = "auth-mode-button-selected";
    confirm_password_field.className = "password-input";
    
});

sign_in_button.addEventListener('click', function(e) {
    password_field.attributes.autocomplete = "current-password";
    confirm_password_field.className = "hidden";
    confirm_password_field.value = "";
    sign_up_button.className = "auth-mode-button";
    sign_in_button.className = "auth-mode-button-selected";
});


submit_auth_button.addEventListener('click', function(e) {

    const error_div = document.getElementById("error-div");

    // 0 = sign in, 1 = create user, 2 = delete user, 3 = modify user
    if (sign_in_button.className == "auth-mode-button-selected") {

        // 0 = sign in
        var mode = 0;
        userMod(username_field.value, password_field.value, mode, error_div);

    } else {

        // 1 = create user
        var mode = 1;

        var username_value = username_field.value;
        var password_value = password_field.value;
        var confirm_password_value = confirm_password_field.value;
        // do input validation
        if(password_value === confirm_password_value) {
            console.log("password and password confirmation match");

            // check that the password contains at least one lowercase letter
            var format = /[a-z]/;
            if(format.test(password_value) === true) {
                console.log("password contains at least one lowercase letter");

                // check that the password contains at least one uppercase letter
                var format = /[A-Z]/;
                if(format.test(password_value) === true) {
                    console.log("password contains at least one lowercase letter");

                    // check that the password contains a special character
                    var format = /[ `!@#$%^&*()+_\-=\[\]{};':"\\|,.<>\/?~]/;
                    if(format.test(password_value) === true) {
                        console.log("password contains a special character");

                        // check that the password contains a number
                        var format = /[0-9]/;
                        if(format.test(password_value) === true) {
                            console.log("password contains a number");

                            // check username length is at least 6
                            if(username_value.length >= 6) {

                                // check that username doesn't have special characters other than "_"
                                var format = /[ `!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/;
                                if(format.test(username_value) === false) {
                                    
                                    // arg[0] = username, arg[1] = password, arg[2]: 0 = sign in, 1 = create user, 2 = delete user, 3 = modify user
                                    userMod(username_value, password_field.value, mode, error_div);

                                } else {
                                    console.log("// check that username doesn't have special characters other than _");
                                    error_div.innerHTML = "Only underscore '_' special character allowed in username";
                                }

                            } else {
                                console.log("// check username length is at least 6");
                                error_div.innerHTML = "Username must be at least 6 characters";
                            }
                            
                        } else {
                            console.log("// check that the password contains a number");
                            error_div.innerHTML = "Password must contain a number";
                        }

                    } else {
                        console.log("// check that the password contains a special character");
                        error_div.innerHTML = "Password must contain a special character";
                    }

                } else {
                    console.log("// check that the password contains at least one uppercase letter");
                    error_div.innerHTML = "Password must contain at least one uppercase letter";
                }

            } else {
                console.log("// check that the password contains at least one lowercase letter");
                error_div.innerHTML = "Password must contain at least one lowercase letter";
            }

        } else {
            console.log("// passwords don't match");
            error_div.innerHTML = "Passwords do not match";
        }
    }



    
});



