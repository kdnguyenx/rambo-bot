#!/bin/bash

SERVICE=rambo

# Link the service file into place
sudo ln -s /home/rambo/rambo-bot/rambo.service /lib/systemd/system/rambo.service

# Reload the daemon so it knows about the new file
sudo systemctl daemon-reload

# Enable our new service
sudo systemctl enable $SERVICE

# Start the service
sudo systemctl start $SERVICE
