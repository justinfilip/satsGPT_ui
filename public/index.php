<!DOCTYPE html>

<head>

    <meta name="viewport" content="initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no" charset="UTF-8"/>
    <!-- <link rel="icon" type="image/png" href="favicon.png"/> --> 

</head>

<html lang="en">

    <meta charset="utf-8">
    <meta name="description" content="">
    <link href="styles/style_light.css" rel="stylesheet" type="text/css"/>
    <link href="styles/style_dark.css" rel="stylesheet" type="text/css"/>
    <link href="styles/style_night.css" rel="stylesheet" type="text/css"/>
    <link href="styles/style_space.css" rel="stylesheet" type="text/css"/>
    <link href="styles/style_deep.css" rel="stylesheet" type="text/css"/>
    <!-- <link rel="stylesheet" href="/styles/prism.css"> -->
    <title style="display: none;">satsgpt.xyz</title>

    <body id="main_body" class="light_body">
        <center><div id="satsGPT" class="light_satsGPT"></div></center>
        
        <span id="text-input" tabindex="0" class="light_text-input-closed" role="textbox" placeholder="What?" contenteditable></span>
        <div class="send-tooltip">shift + enter /</div>
        <div id="prompt-actions" class="light_prompt-actions"><center><div id="keys_toggle" class="keys-toggle-open"></div></center><div id="text_input_send_button" class="text-input-send-button"></div></div>
        <div class="light_actions">

            <div id="navbar" class="navbar">
                <div id="promptbutton" targetpage="promptpage" class="light_navbutton">Prompt</div>
                <div id="accountbutton" targetpage="accountpage" class="light_navbutton">Account</div>
                <div id="aboutbutton" targetpage="aboutpage" class="light_navbutton">About</div>
            </div>
            <img id="light-dark-toggle" class="light_toggle" src="media/light_dark_toggle.png"></img>
        </div>

        <div id="promptpage" class="pagehidden">

            <div id="history-window" class="history-window">
                <!-- User, agent dialoge history -->
            </div>
            
        </div>


        <div id="accountpage" class="pagehidden">
            <center>
                C
            </center>
        </div>



        <div id="aboutpage" class="pagehidden">
            <center>
                inference for sats, how about it
            </center>
        </div>

        
    </body>

    <script src="scripts/main.js"></script>
    <!-- <script src="scripts/prism.js"></script> -->

</html>