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
                    // console.log("waiting");
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

            sendPrompt(prompt);
        }
    }
    
}

// Send button to send

send_button.addEventListener('pointerdown', async function(e) {

    var prompt = text_input.innerText;
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

function msToLocalDateTime(millis) {
    // Create a new Date object from the input milliseconds
    const date = new Date(millis);
    
    // Get the user's time zone offset in minutes
    const timeZoneOffset = date.getTimezoneOffset();
    
    // Convert the time zone offset to milliseconds
    const timeZoneOffsetMilliseconds = timeZoneOffset * 60 * 1000;
    
    // Subtract the time zone offset from the input milliseconds
    // to get the local date and time
    const localDateAndTimeMillis = millis - timeZoneOffsetMilliseconds;
    
    // Create a new Date object with the local date and time
    const localDate = new Date(localDateAndTimeMillis);
    
    // Format the local date and time as a string
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const localDateTimeString = localDate.toLocaleString('en-US', options);
    
    // Return the formatted local date and time string
    return localDateTimeString;
}

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
            error_div.innerHTML = "Authentication successful";
            setTimeout(function(e) {window.location.reload();}, 1500);
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
    .then(response => response.text())
    .then(data => {
    
        data = JSON.parse(data);
        returned_id  = data['user_id'];
        expiry_time = data['expiry_time']; // in ms

        if (expiry_time <= Date.now()) {

            collectUserPayment(returned_id);
        } else {

            const account_info_container = document.createElement('center');
            const account_info = document.createElement('div');
            account_info.innerHTML = '<b>Subscription expiration date:</b></br></br>' + msToLocalDateTime(expiry_time) + ', in your detected timezone.</br></br>When your subscription expires, you will be prompted to renew it.</br></br>Thank you for using satsGPT!';
            account_info.className = 'account-info-text';

            account_info_container.appendChild(account_info);
            document.getElementById("accountpage").appendChild(account_info_container);
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
    document.getElementById("accountbutton").className = display_mode + 'navbuttonselected';
    document.getElementById("promptpage").className = "hidden";
    text_input.className = "hidden";
    prompt_actions.className = "hidden";
    keys_toggle.className = "hidden";
    send_button.className = "hidden";
    send_tip.className = "hidden";

    document.getElementById("accountpage").innerHTML = "";
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
    
        // console.log(data);
        data = JSON.parse(data);

        // get payment_request from response
        let payment_request = data['payment_request'];
        // console.log("Payment request: " + payment_request);

        let amount_sats = data['amount_sats'];
        let btc_price = data['btc_price']

        const payment_container = document.createElement('center');
        payment_container.className = 'payment-container';


        const qr_div = document.createElement('div');
        qr_div.id = 'qr-div';
        qr_div.className = 'qr-div';

        const payment_text_element = document.createElement('div');
        
        payment_text_element.id = "payment-text-element";
        payment_text_element.className = "pay-text";
        payment_text_element.innerHTML = "<b>Pay this $5 lightning invoice (" + amount_sats + " sats @ $" + btc_price + " USD/Bitcoin) for 30 days of access to satsGPT. By paying this invoice, you are agreeing to the terms & conditions listed at the bottom of this page</b>";

        const payment_notification_element = document.createElement('div');

        payment_notification_element.id = "payment-notification-element";
        payment_notification_element.className = "auth-error-text";

        qr_div.prepend(payment_notification_element);
        qr_div.prepend(payment_text_element);

        payment_container.prepend(payment_notification_element);
        payment_container.prepend(payment_text_element);
        payment_container.appendChild(qr_div);
        

        document.getElementById("accountpage").appendChild(payment_container);

        const qr_element = document.getElementById("qr-div");

        const qrCode = new QRCode(qr_element, {
            width: 250,
            height: 250,
            colorDark : "#000000", // Set the color of the dark pixels (black)
            colorLight : "#ffffff", // Set the color of the light pixels (white)
            correctLevel : QRCode.CorrectLevel.H // Set the correction level to H (high)
        });
        
        qrCode.makeCode(payment_request);



        const invoice_text_container = document.createElement('center');
        const invoice_text = document.createElement('center');
        invoice_text.innerHTML = payment_request;
        invoice_text.className = 'invoice-text-container';

        // invoice_text_container.addEventListener('click', function(e) {

        // });

        let terms_conditions_text = document.createElement('div');
        terms_conditions_text.className = "terms-conditions-text";
        terms_conditions_text.innerHTML = "<b>Terms & Conditions:</b></br></br>\
        1. Your personal information is not collected unless voluntarily included in your username. If that occurs, that's your problem, so it is suggested that you do not include sensitive personal information in your username.</br></br>\
        2. This service will be available to you for the duration of 30 days, not including maintenance windows and service interruptions. Any pre-planned maintenance windows will be announced 24 hours in advance, within this application. At the time of account creation, you were provided a recovery key for your account. This recovery key is the only way to recover your account and it is your responsibility to keep it safe.</br></br>\
        3. Your interaction data (prompts, token output) with the open-source models used in this application exists momentarily on the server as it is being processed or generated and is deleted after your prompt has completed processing. You are responsible for saving outputs that you want to use later.</br></br>\
        4. Performance and usage data will be used to improve the service.</br></br>\
        5. You will be solely responsible for how you use and interpret the data generated in this application, and you release satsGPT and related or affiliated persons or entities from liability in any and all instances where data from this application was used or interpreted in a way that harms yourself or others both directly and indrectly by way of the use of this application or the use of 3rd party application code within this program."

        invoice_text_container.appendChild(invoice_text);
        invoice_text_container.appendChild(terms_conditions_text);
        document.getElementById("accountpage").appendChild(invoice_text_container);

        

        setInterval(function() {checkInvoice(returned_id)}, 5000);

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
        
            // console.log(data);
            data = JSON.parse(data);
    
            // if response contains confirmed payment (expiry time > now by whatever)
            // reload interface with expiry time cookie

            if (data['payment_status'] === 1) {
                document.getElementById('payment-notification-element').innerHTML = "Payment successful";
                setTimeout(function() {window.location.reload();}, 1500);
            }
            
            // else
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
            // console.log("password and password confirmation match");

            // check that the password contains at least one lowercase letter
            var format = /[a-z]/;
            if(format.test(password_value) === true) {
                // console.log("password contains at least one lowercase letter");

                // check that the password contains at least one uppercase letter
                var format = /[A-Z]/;
                if(format.test(password_value) === true) {
                    // console.log("password contains at least one lowercase letter");

                    // check that the password contains a special character
                    var format = /[ `!@#$%^&*()+_\-=\[\]{};':"\\|,.<>\/?~]/;
                    if(format.test(password_value) === true) {
                        // console.log("password contains a special character");

                        // check that the password contains a number
                        var format = /[0-9]/;
                        if(format.test(password_value) === true) {
                            // console.log("password contains a number");

                            // check username length is at least 6
                            if(username_value.length >= 6) {

                                // check that username doesn't have special characters other than "_"
                                var format = /[ `!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/;
                                if(format.test(username_value) === false) {
                                    
                                    // arg[0] = username, arg[1] = password, arg[2]: 0 = sign in, 1 = create user, 2 = delete user, 3 = modify user
                                    userMod(username_value, password_field.value, mode, error_div);

                                } else {
                                    error_div.innerHTML = "Only underscore '_' special character allowed in username";
                                }

                            } else {
                                error_div.innerHTML = "Username must be at least 6 characters";
                            }
                            
                        } else {
                            error_div.innerHTML = "Password must contain a number";
                        }

                    } else {
                        error_div.innerHTML = "Password must contain a special character";
                    }

                } else {
                    error_div.innerHTML = "Password must contain at least one uppercase letter";
                }

            } else {
                error_div.innerHTML = "Password must contain at least one lowercase letter";
            }

        } else {
            error_div.innerHTML = "Passwords do not match";
        }
    }



    
});

// qrcode.js

var QRCode;!function(){function a(a){this.mode=c.MODE_8BIT_BYTE,this.data=a,this.parsedData=[];for(var b=[],d=0,e=this.data.length;e>d;d++){var f=this.data.charCodeAt(d);f>65536?(b[0]=240|(1835008&f)>>>18,b[1]=128|(258048&f)>>>12,b[2]=128|(4032&f)>>>6,b[3]=128|63&f):f>2048?(b[0]=224|(61440&f)>>>12,b[1]=128|(4032&f)>>>6,b[2]=128|63&f):f>128?(b[0]=192|(1984&f)>>>6,b[1]=128|63&f):b[0]=f,this.parsedData=this.parsedData.concat(b)}this.parsedData.length!=this.data.length&&(this.parsedData.unshift(191),this.parsedData.unshift(187),this.parsedData.unshift(239))}function b(a,b){this.typeNumber=a,this.errorCorrectLevel=b,this.modules=null,this.moduleCount=0,this.dataCache=null,this.dataList=[]}function i(a,b){if(void 0==a.length)throw new Error(a.length+"/"+b);for(var c=0;c<a.length&&0==a[c];)c++;this.num=new Array(a.length-c+b);for(var d=0;d<a.length-c;d++)this.num[d]=a[d+c]}function j(a,b){this.totalCount=a,this.dataCount=b}function k(){this.buffer=[],this.length=0}function m(){return"undefined"!=typeof CanvasRenderingContext2D}function n(){var a=!1,b=navigator.userAgent;return/android/i.test(b)&&(a=!0,aMat=b.toString().match(/android ([0-9]\.[0-9])/i),aMat&&aMat[1]&&(a=parseFloat(aMat[1]))),a}function r(a,b){for(var c=1,e=s(a),f=0,g=l.length;g>=f;f++){var h=0;switch(b){case d.L:h=l[f][0];break;case d.M:h=l[f][1];break;case d.Q:h=l[f][2];break;case d.H:h=l[f][3]}if(h>=e)break;c++}if(c>l.length)throw new Error("Too long data");return c}function s(a){var b=encodeURI(a).toString().replace(/\%[0-9a-fA-F]{2}/g,"a");return b.length+(b.length!=a?3:0)}a.prototype={getLength:function(){return this.parsedData.length},write:function(a){for(var b=0,c=this.parsedData.length;c>b;b++)a.put(this.parsedData[b],8)}},b.prototype={addData:function(b){var c=new a(b);this.dataList.push(c),this.dataCache=null},isDark:function(a,b){if(0>a||this.moduleCount<=a||0>b||this.moduleCount<=b)throw new Error(a+","+b);return this.modules[a][b]},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(a,c){this.moduleCount=4*this.typeNumber+17,this.modules=new Array(this.moduleCount);for(var d=0;d<this.moduleCount;d++){this.modules[d]=new Array(this.moduleCount);for(var e=0;e<this.moduleCount;e++)this.modules[d][e]=null}this.setupPositionProbePattern(0,0),this.setupPositionProbePattern(this.moduleCount-7,0),this.setupPositionProbePattern(0,this.moduleCount-7),this.setupPositionAdjustPattern(),this.setupTimingPattern(),this.setupTypeInfo(a,c),this.typeNumber>=7&&this.setupTypeNumber(a),null==this.dataCache&&(this.dataCache=b.createData(this.typeNumber,this.errorCorrectLevel,this.dataList)),this.mapData(this.dataCache,c)},setupPositionProbePattern:function(a,b){for(var c=-1;7>=c;c++)if(!(-1>=a+c||this.moduleCount<=a+c))for(var d=-1;7>=d;d++)-1>=b+d||this.moduleCount<=b+d||(this.modules[a+c][b+d]=c>=0&&6>=c&&(0==d||6==d)||d>=0&&6>=d&&(0==c||6==c)||c>=2&&4>=c&&d>=2&&4>=d?!0:!1)},getBestMaskPattern:function(){for(var a=0,b=0,c=0;8>c;c++){this.makeImpl(!0,c);var d=f.getLostPoint(this);(0==c||a>d)&&(a=d,b=c)}return b},createMovieClip:function(a,b,c){var d=a.createEmptyMovieClip(b,c),e=1;this.make();for(var f=0;f<this.modules.length;f++)for(var g=f*e,h=0;h<this.modules[f].length;h++){var i=h*e,j=this.modules[f][h];j&&(d.beginFill(0,100),d.moveTo(i,g),d.lineTo(i+e,g),d.lineTo(i+e,g+e),d.lineTo(i,g+e),d.endFill())}return d},setupTimingPattern:function(){for(var a=8;a<this.moduleCount-8;a++)null==this.modules[a][6]&&(this.modules[a][6]=0==a%2);for(var b=8;b<this.moduleCount-8;b++)null==this.modules[6][b]&&(this.modules[6][b]=0==b%2)},setupPositionAdjustPattern:function(){for(var a=f.getPatternPosition(this.typeNumber),b=0;b<a.length;b++)for(var c=0;c<a.length;c++){var d=a[b],e=a[c];if(null==this.modules[d][e])for(var g=-2;2>=g;g++)for(var h=-2;2>=h;h++)this.modules[d+g][e+h]=-2==g||2==g||-2==h||2==h||0==g&&0==h?!0:!1}},setupTypeNumber:function(a){for(var b=f.getBCHTypeNumber(this.typeNumber),c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[Math.floor(c/3)][c%3+this.moduleCount-8-3]=d}for(var c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[c%3+this.moduleCount-8-3][Math.floor(c/3)]=d}},setupTypeInfo:function(a,b){for(var c=this.errorCorrectLevel<<3|b,d=f.getBCHTypeInfo(c),e=0;15>e;e++){var g=!a&&1==(1&d>>e);6>e?this.modules[e][8]=g:8>e?this.modules[e+1][8]=g:this.modules[this.moduleCount-15+e][8]=g}for(var e=0;15>e;e++){var g=!a&&1==(1&d>>e);8>e?this.modules[8][this.moduleCount-e-1]=g:9>e?this.modules[8][15-e-1+1]=g:this.modules[8][15-e-1]=g}this.modules[this.moduleCount-8][8]=!a},mapData:function(a,b){for(var c=-1,d=this.moduleCount-1,e=7,g=0,h=this.moduleCount-1;h>0;h-=2)for(6==h&&h--;;){for(var i=0;2>i;i++)if(null==this.modules[d][h-i]){var j=!1;g<a.length&&(j=1==(1&a[g]>>>e));var k=f.getMask(b,d,h-i);k&&(j=!j),this.modules[d][h-i]=j,e--,-1==e&&(g++,e=7)}if(d+=c,0>d||this.moduleCount<=d){d-=c,c=-c;break}}}},b.PAD0=236,b.PAD1=17,b.createData=function(a,c,d){for(var e=j.getRSBlocks(a,c),g=new k,h=0;h<d.length;h++){var i=d[h];g.put(i.mode,4),g.put(i.getLength(),f.getLengthInBits(i.mode,a)),i.write(g)}for(var l=0,h=0;h<e.length;h++)l+=e[h].dataCount;if(g.getLengthInBits()>8*l)throw new Error("code length overflow. ("+g.getLengthInBits()+">"+8*l+")");for(g.getLengthInBits()+4<=8*l&&g.put(0,4);0!=g.getLengthInBits()%8;)g.putBit(!1);for(;;){if(g.getLengthInBits()>=8*l)break;if(g.put(b.PAD0,8),g.getLengthInBits()>=8*l)break;g.put(b.PAD1,8)}return b.createBytes(g,e)},b.createBytes=function(a,b){for(var c=0,d=0,e=0,g=new Array(b.length),h=new Array(b.length),j=0;j<b.length;j++){var k=b[j].dataCount,l=b[j].totalCount-k;d=Math.max(d,k),e=Math.max(e,l),g[j]=new Array(k);for(var m=0;m<g[j].length;m++)g[j][m]=255&a.buffer[m+c];c+=k;var n=f.getErrorCorrectPolynomial(l),o=new i(g[j],n.getLength()-1),p=o.mod(n);h[j]=new Array(n.getLength()-1);for(var m=0;m<h[j].length;m++){var q=m+p.getLength()-h[j].length;h[j][m]=q>=0?p.get(q):0}}for(var r=0,m=0;m<b.length;m++)r+=b[m].totalCount;for(var s=new Array(r),t=0,m=0;d>m;m++)for(var j=0;j<b.length;j++)m<g[j].length&&(s[t++]=g[j][m]);for(var m=0;e>m;m++)for(var j=0;j<b.length;j++)m<h[j].length&&(s[t++]=h[j][m]);return s};for(var c={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},d={L:1,M:0,Q:3,H:2},e={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},f={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(a){for(var b=a<<10;f.getBCHDigit(b)-f.getBCHDigit(f.G15)>=0;)b^=f.G15<<f.getBCHDigit(b)-f.getBCHDigit(f.G15);return(a<<10|b)^f.G15_MASK},getBCHTypeNumber:function(a){for(var b=a<<12;f.getBCHDigit(b)-f.getBCHDigit(f.G18)>=0;)b^=f.G18<<f.getBCHDigit(b)-f.getBCHDigit(f.G18);return a<<12|b},getBCHDigit:function(a){for(var b=0;0!=a;)b++,a>>>=1;return b},getPatternPosition:function(a){return f.PATTERN_POSITION_TABLE[a-1]},getMask:function(a,b,c){switch(a){case e.PATTERN000:return 0==(b+c)%2;case e.PATTERN001:return 0==b%2;case e.PATTERN010:return 0==c%3;case e.PATTERN011:return 0==(b+c)%3;case e.PATTERN100:return 0==(Math.floor(b/2)+Math.floor(c/3))%2;case e.PATTERN101:return 0==b*c%2+b*c%3;case e.PATTERN110:return 0==(b*c%2+b*c%3)%2;case e.PATTERN111:return 0==(b*c%3+(b+c)%2)%2;default:throw new Error("bad maskPattern:"+a)}},getErrorCorrectPolynomial:function(a){for(var b=new i([1],0),c=0;a>c;c++)b=b.multiply(new i([1,g.gexp(c)],0));return b},getLengthInBits:function(a,b){if(b>=1&&10>b)switch(a){case c.MODE_NUMBER:return 10;case c.MODE_ALPHA_NUM:return 9;case c.MODE_8BIT_BYTE:return 8;case c.MODE_KANJI:return 8;default:throw new Error("mode:"+a)}else if(27>b)switch(a){case c.MODE_NUMBER:return 12;case c.MODE_ALPHA_NUM:return 11;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 10;default:throw new Error("mode:"+a)}else{if(!(41>b))throw new Error("type:"+b);switch(a){case c.MODE_NUMBER:return 14;case c.MODE_ALPHA_NUM:return 13;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 12;default:throw new Error("mode:"+a)}}},getLostPoint:function(a){for(var b=a.getModuleCount(),c=0,d=0;b>d;d++)for(var e=0;b>e;e++){for(var f=0,g=a.isDark(d,e),h=-1;1>=h;h++)if(!(0>d+h||d+h>=b))for(var i=-1;1>=i;i++)0>e+i||e+i>=b||(0!=h||0!=i)&&g==a.isDark(d+h,e+i)&&f++;f>5&&(c+=3+f-5)}for(var d=0;b-1>d;d++)for(var e=0;b-1>e;e++){var j=0;a.isDark(d,e)&&j++,a.isDark(d+1,e)&&j++,a.isDark(d,e+1)&&j++,a.isDark(d+1,e+1)&&j++,(0==j||4==j)&&(c+=3)}for(var d=0;b>d;d++)for(var e=0;b-6>e;e++)a.isDark(d,e)&&!a.isDark(d,e+1)&&a.isDark(d,e+2)&&a.isDark(d,e+3)&&a.isDark(d,e+4)&&!a.isDark(d,e+5)&&a.isDark(d,e+6)&&(c+=40);for(var e=0;b>e;e++)for(var d=0;b-6>d;d++)a.isDark(d,e)&&!a.isDark(d+1,e)&&a.isDark(d+2,e)&&a.isDark(d+3,e)&&a.isDark(d+4,e)&&!a.isDark(d+5,e)&&a.isDark(d+6,e)&&(c+=40);for(var k=0,e=0;b>e;e++)for(var d=0;b>d;d++)a.isDark(d,e)&&k++;var l=Math.abs(100*k/b/b-50)/5;return c+=10*l}},g={glog:function(a){if(1>a)throw new Error("glog("+a+")");return g.LOG_TABLE[a]},gexp:function(a){for(;0>a;)a+=255;for(;a>=256;)a-=255;return g.EXP_TABLE[a]},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)},h=0;8>h;h++)g.EXP_TABLE[h]=1<<h;for(var h=8;256>h;h++)g.EXP_TABLE[h]=g.EXP_TABLE[h-4]^g.EXP_TABLE[h-5]^g.EXP_TABLE[h-6]^g.EXP_TABLE[h-8];for(var h=0;255>h;h++)g.LOG_TABLE[g.EXP_TABLE[h]]=h;i.prototype={get:function(a){return this.num[a]},getLength:function(){return this.num.length},multiply:function(a){for(var b=new Array(this.getLength()+a.getLength()-1),c=0;c<this.getLength();c++)for(var d=0;d<a.getLength();d++)b[c+d]^=g.gexp(g.glog(this.get(c))+g.glog(a.get(d)));return new i(b,0)},mod:function(a){if(this.getLength()-a.getLength()<0)return this;for(var b=g.glog(this.get(0))-g.glog(a.get(0)),c=new Array(this.getLength()),d=0;d<this.getLength();d++)c[d]=this.get(d);for(var d=0;d<a.getLength();d++)c[d]^=g.gexp(g.glog(a.get(d))+b);return new i(c,0).mod(a)}},j.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],j.getRSBlocks=function(a,b){var c=j.getRsBlockTable(a,b);if(void 0==c)throw new Error("bad rs block @ typeNumber:"+a+"/errorCorrectLevel:"+b);for(var d=c.length/3,e=[],f=0;d>f;f++)for(var g=c[3*f+0],h=c[3*f+1],i=c[3*f+2],k=0;g>k;k++)e.push(new j(h,i));return e},j.getRsBlockTable=function(a,b){switch(b){case d.L:return j.RS_BLOCK_TABLE[4*(a-1)+0];case d.M:return j.RS_BLOCK_TABLE[4*(a-1)+1];case d.Q:return j.RS_BLOCK_TABLE[4*(a-1)+2];case d.H:return j.RS_BLOCK_TABLE[4*(a-1)+3];default:return void 0}},k.prototype={get:function(a){var b=Math.floor(a/8);return 1==(1&this.buffer[b]>>>7-a%8)},put:function(a,b){for(var c=0;b>c;c++)this.putBit(1==(1&a>>>b-c-1))},getLengthInBits:function(){return this.length},putBit:function(a){var b=Math.floor(this.length/8);this.buffer.length<=b&&this.buffer.push(0),a&&(this.buffer[b]|=128>>>this.length%8),this.length++}};var l=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]],o=function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){function g(a,b){var c=document.createElementNS("http://www.w3.org/2000/svg",a);for(var d in b)b.hasOwnProperty(d)&&c.setAttribute(d,b[d]);return c}var b=this._htOption,c=this._el,d=a.getModuleCount();Math.floor(b.width/d),Math.floor(b.height/d),this.clear();var h=g("svg",{viewBox:"0 0 "+String(d)+" "+String(d),width:"100%",height:"100%",fill:b.colorLight});h.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink"),c.appendChild(h),h.appendChild(g("rect",{fill:b.colorDark,width:"1",height:"1",id:"template"}));for(var i=0;d>i;i++)for(var j=0;d>j;j++)if(a.isDark(i,j)){var k=g("use",{x:String(i),y:String(j)});k.setAttributeNS("http://www.w3.org/1999/xlink","href","#template"),h.appendChild(k)}},a.prototype.clear=function(){for(;this._el.hasChildNodes();)this._el.removeChild(this._el.lastChild)},a}(),p="svg"===document.documentElement.tagName.toLowerCase(),q=p?o:m()?function(){function a(){this._elImage.src=this._elCanvas.toDataURL("image/png"),this._elImage.style.display="block",this._elCanvas.style.display="none"}function d(a,b){var c=this;if(c._fFail=b,c._fSuccess=a,null===c._bSupportDataURI){var d=document.createElement("img"),e=function(){c._bSupportDataURI=!1,c._fFail&&_fFail.call(c)},f=function(){c._bSupportDataURI=!0,c._fSuccess&&c._fSuccess.call(c)};return d.onabort=e,d.onerror=e,d.onload=f,d.src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",void 0}c._bSupportDataURI===!0&&c._fSuccess?c._fSuccess.call(c):c._bSupportDataURI===!1&&c._fFail&&c._fFail.call(c)}if(this._android&&this._android<=2.1){var b=1/window.devicePixelRatio,c=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(a,d,e,f,g,h,i,j){if("nodeName"in a&&/img/i.test(a.nodeName))for(var l=arguments.length-1;l>=1;l--)arguments[l]=arguments[l]*b;else"undefined"==typeof j&&(arguments[1]*=b,arguments[2]*=b,arguments[3]*=b,arguments[4]*=b);c.apply(this,arguments)}}var e=function(a,b){this._bIsPainted=!1,this._android=n(),this._htOption=b,this._elCanvas=document.createElement("canvas"),this._elCanvas.width=b.width,this._elCanvas.height=b.height,a.appendChild(this._elCanvas),this._el=a,this._oContext=this._elCanvas.getContext("2d"),this._bIsPainted=!1,this._elImage=document.createElement("img"),this._elImage.style.display="none",this._el.appendChild(this._elImage),this._bSupportDataURI=null};return e.prototype.draw=function(a){var b=this._elImage,c=this._oContext,d=this._htOption,e=a.getModuleCount(),f=d.width/e,g=d.height/e,h=Math.round(f),i=Math.round(g);b.style.display="none",this.clear();for(var j=0;e>j;j++)for(var k=0;e>k;k++){var l=a.isDark(j,k),m=k*f,n=j*g;c.strokeStyle=l?d.colorDark:d.colorLight,c.lineWidth=1,c.fillStyle=l?d.colorDark:d.colorLight,c.fillRect(m,n,f,g),c.strokeRect(Math.floor(m)+.5,Math.floor(n)+.5,h,i),c.strokeRect(Math.ceil(m)-.5,Math.ceil(n)-.5,h,i)}this._bIsPainted=!0},e.prototype.makeImage=function(){this._bIsPainted&&d.call(this,a)},e.prototype.isPainted=function(){return this._bIsPainted},e.prototype.clear=function(){this._oContext.clearRect(0,0,this._elCanvas.width,this._elCanvas.height),this._bIsPainted=!1},e.prototype.round=function(a){return a?Math.floor(1e3*a)/1e3:a},e}():function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){for(var b=this._htOption,c=this._el,d=a.getModuleCount(),e=Math.floor(b.width/d),f=Math.floor(b.height/d),g=['<table style="border:0;border-collapse:collapse;">'],h=0;d>h;h++){g.push("<tr>");for(var i=0;d>i;i++)g.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:'+e+"px;height:"+f+"px;background-color:"+(a.isDark(h,i)?b.colorDark:b.colorLight)+';"></td>');g.push("</tr>")}g.push("</table>"),c.innerHTML=g.join("");var j=c.childNodes[0],k=(b.width-j.offsetWidth)/2,l=(b.height-j.offsetHeight)/2;k>0&&l>0&&(j.style.margin=l+"px "+k+"px")},a.prototype.clear=function(){this._el.innerHTML=""},a}();QRCode=function(a,b){if(this._htOption={width:256,height:256,typeNumber:4,colorDark:"#000000",colorLight:"#ffffff",correctLevel:d.H},"string"==typeof b&&(b={text:b}),b)for(var c in b)this._htOption[c]=b[c];"string"==typeof a&&(a=document.getElementById(a)),this._android=n(),this._el=a,this._oQRCode=null,this._oDrawing=new q(this._el,this._htOption),this._htOption.text&&this.makeCode(this._htOption.text)},QRCode.prototype.makeCode=function(a){this._oQRCode=new b(r(a,this._htOption.correctLevel),this._htOption.correctLevel),this._oQRCode.addData(a),this._oQRCode.make(),this._el.title=a,this._oDrawing.draw(this._oQRCode),this.makeImage()},QRCode.prototype.makeImage=function(){"function"==typeof this._oDrawing.makeImage&&(!this._android||this._android>=3)&&this._oDrawing.makeImage()},QRCode.prototype.clear=function(){this._oDrawing.clear()},QRCode.CorrectLevel=d}();