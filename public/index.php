<!DOCTYPE html>

<head>

    <meta property="og:image" content="media/x_pic.png" />
    <meta name="viewport" content="initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no" charset="UTF-8"/>
    <link rel="icon" type="image/png" href="media/favicon.png"/> 
    <link rel="manifest" href="manifest.json" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta id="pwa-theme" name="theme-color" content="#000000" style="transition: .2s ease-in-out;">
    <meta name="view-transition" content="same-origin">

</head>

<html lang="en">

    <meta charset="utf-8">
    <meta name="description" content="">
    <link href="styles/style_light.css" rel="stylesheet" type="text/css"/>
    <link href="styles/style_dark.css" rel="stylesheet" type="text/css"/>
    <!-- <link rel="stylesheet" href="/styles/prism.css"> -->
    <title style="display: none;">satsGPT</title>

    <body id="main_body" class="light_body">
        <center><div id="satsGPT" class="light_satsGPT"></div></center>
        
        <span id="text_input" tabindex="0" class="light_text-input-closed" role="textbox" placeholder="What?" contenteditable></span>
        <div id="send_tip" class="send-tooltip">send: shift + enter /</div>
        <div id="prompt_actions" class="light_prompt-actions"><center><div id="keys_toggle" class="keys-toggle-open"></div></center><div id="text_input_send_button" class="text-input-send-button"></div></div>
        <div class="light_actions">

            <div id="navbar" class="navbar">
                <div id="promptbutton" targetpage="promptpage" class="light_navbutton">Prompt</div>
                <div id="accountbutton" targetpage="accountpage" class="light_navbutton">Account</div>
                <div id="aboutbutton" targetpage="aboutpage" class="light_navbutton">About</div>
            </div>
            <img id="light-dark-toggle" class="light_toggle" src="media/light_dark_toggle.png"></img>
        </div>

        <div id="promptpage" class="hidden">

            <div id="history_window" class="history-window">
                <!-- User, agent dialoge history -->
            </div>
            
        </div>

        <div id="accountpage" class="hidden">
            <div id="account-details" class="account_details">

            </div>
            <div id="account-auth" class="hidden">
                <center>
                <!-- // sign up
                    // username
                    // password
                    // arg[0] = username, arg[1] = password, arg[2]: 0 = create user, 1 = delete user, 2 = modify user
                    // userMod('ssdsdsds', 'qwerqwerqwrewqrerqw', 0);
                    // if error when doing sign up call after retries, "credentials taken" -->
                    <form autocomplete="on">
                        <div class="auth-text">Sign in to your satsGPT account or click "Sign up" to create an account</div>
                        <div id="error-div" class="auth-error-text"></div>
                        <div id="auth-container" class="auth-container">
                            
                            <div tabindex="1" id="sign-in-button" class="auth-mode-button-selected">Sign in</div>
                            <div tabindex="2" id="sign-up-button" class="auth-mode-button">Sign up</div>
                        </div>
                        
                        <input tabindex="3" id="username-field" type="text" name="username" maxlength="20" title="Your username" autocomplete="username" placeholder="Username" value="" autocapitalize="off" autocorrect="off" class="username-input">


                        <input tabindex="4" id="password-field" type="password" name="password" maxlength="32" title="Your password" placeholder="Password" autocomplete="new-password" class="password-input">

                        <input tabindex="5" id="confirm-password-field" type="password" name="conf_password" maxlength="32" title="Password Confirmation" placeholder="Confirm password" autocomplete="new-password" class="hidden">

                        <div class="auth-container">

                            <div tabindex="7" id="recover-account-button" class="auth-mode-button">Recover Account</div>
                            <div tabindex="6" id="auth-submit-button" class="auth-mode-button">Submit</div>

                        </div>
                    </form>

                <!-- // sign in

                    // username
                    // password

                    // sign in button

                    // or recover acccount

                        // username
                        // recovery key
                                // sha256(username + concatenated_key)
                                // separate lookup table that has the recovery key as id and the corresponding current user_hash,
                                // if located in table, send user to update password, then sign in
                        
                        // recover button -->

                </center>
            </div>
        </div>

        <div id="aboutpage" class="hidden">
            <center><img id="light_satsGPT" class="satsGPT" src="media/light_about_satsGPT.png"></img></center>
            <center><img id="dark_satsGPT" class="satsGPT-invisible" src="media/dark_about_satsGPT.png"></img></center>
            <center><p class="follow-x-text">Follow</p><a class="follow-x-text" href="https://x.com/satsGPT">@satsGPT</a><p class="follow-x-text">on 𝕏</p></center>
        </div>

        <script src="scripts/main.js"></script>
        
        <!-- <script src="scripts/prism.js"></script> -->

    </body>

</html>