#!/bin/bash

# Set directory where your HTML file is located
#DIR="/app/app"

# Set port
#PORT=8080

#cd "$DIR" || exit

#echo "Serving on http://0.0.0.0:$PORT"
#python3 -m http.server $PORT
python3 /app/app/https_sever.py
