#!/bin/sh
sudo docker build -t satsgpt_ui /home/user/satsGPT_ui/. > /dev/null
sudo docker run -h satsgpt.xyz -p 443:443 satsgpt_ui > /dev/null && wait