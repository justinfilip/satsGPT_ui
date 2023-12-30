#!/bin/sh
docker rm -f $(docker ps -a -q --filter "ancestor=satsgpt_ui") & 