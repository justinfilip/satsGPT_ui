// use cookie to store the user and wether the user has agreed to the terms
// if no user hash key cookie available, sign the user up
// if no cookie for user terms, check database if user is agreed to terms

// ^ IF User is compliant
// Load the interface and prompt focus:

// # Both of the following to be created in JS/PHP at user sign up
// # user_id= message.get('user_id') # Bitcoin/lightning address
// # password = message.get('password')

const history_container = document.getElementById("history-window");
const text_input = document.getElementById("text-input");
var prompt_page = document.getElementById("promptpage");
const navbar = document.getElementById("navbar");
const navbuttons = navbar.children;

var display_mode = ""
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
            activepages[i].className = 'pagehidden';
        }

        e.target.className = display_mode + 'navbuttonselected';
        document.getElementById(targetpage).className = 'activepage';
    });

    document.getElementById('promptbutton').className = display_mode + 'navbuttonselected';
    document.getElementById('promptpage').className = 'activepage';
}

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

    if (mode === 0) {
        // cycling themes
        if (display_mode === 'light_') {
            display_mode = 'dark_';
        } else if (display_mode === 'dark_') {
            display_mode = 'light_';
        } else {
            console.log("shouldn't be here");
        }
    
        setCookie('display_mode', display_mode);
    }    

    var themed_elements = document.querySelectorAll('[class*="_"]');

    for (i=0;i<themed_elements.length;i++) {
        themed_elements[i].className = display_mode + themed_elements[i].className.split("_")[1]
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

dark_light_toggle.addEventListener('click', function(e) {

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

        // console.log(data);
        // data = JSON.parse(data);
        last_token = data[prompt_id][1]

        if (data[prompt_id][0] === 1) {

            try {
                document.getElementById(prompt_id).innerText += ' ' + data[prompt_id][2];
            } catch {
                // Element was likely deleted by user canceling inference task
                return
            }
 
            setTimeout(function (e) {
                getTokens(prompt_id, last_token);
            }, 2500);
            
        } else if (data[prompt_id][0] === 0) {

            try {
                document.getElementById(prompt_id).innerText += ' ' + data[prompt_id][2];
            } catch {
                // Element was likely deleted by user canceling inference task
                return
            }
            
            setTimeout(function (e) {
                document.getElementById("prompt_" + prompt_id).className = display_mode + "history-prompt-element";
                document.getElementById("action_" + prompt_id).className = display_mode + "history-prompt-element-cancel-button-hidden";
            }, 2500);
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

            history_action_button.addEventListener('click', function(e) {
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
            }, 5000);

        } else {
            text_input.innerText = "What do you think?";
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Sending prompts

const send_button = document.getElementById('text_input_send_button');

// Make sure the user's prompt is formatted properly:

async function validateSendPrompt(send_button, prompt) {
    if(prompt.length < 5 || text_input.innerHTML == '<i id="placeholder">Write your prompt here</i>') {
        send_button.className = "text-input-send-button-rejected";
        setTimeout(function (e) {
            send_button.className = "text-input-send-button";
        }, 300);
        // Let the user know the prompt isn't long enough
        return

    } else {
        send_button.className = "text-input-send-button-selected";
        setTimeout(function (e) {
            send_button.className = "text-input-send-button";
        }, 300);
        sendPrompt(prompt);
    }
}

// Send button to send

send_button.addEventListener('pointerdown', async function(e) {

    var prompt = text_input.innerText
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

document.getElementById("keys_toggle").addEventListener('pointerdown', function(e) {
    // event listener for open/close input
    
    if (text_input_open == 0) {
        text_input_open = 1;
        document.getElementById("keys_toggle").className = "keys-toggle-open";
        text_input.className = display_mode + "text-input";
    } else {
        text_input_open = 0;
        document.getElementById("keys_toggle").className = "keys-toggle-close";
        text_input.className = display_mode + "text-input-closed";
    }
});

// Auxillary functions:

function readCookie(name) {
    
    return (name = new RegExp('(?:^|;\\s*)' + ('' + name).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '=([^;]*)').exec(document.cookie)) && name[1];

}

function setCookie(name, value) {
    document.cookie = name + "=" + value;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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