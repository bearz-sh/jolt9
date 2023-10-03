#!/bin/bash

if ! grep -q "POWERSHELL_TELEMETRY_OPTOUT" "/etc/environment"; then
    echo "POWERSHELL_TELEMETRY_OPTOUT=1" || sudo tee -a /etc/environment
fi

if ! command -v pwsh &> /dev/null; then 
    sudo apt install pwsh -y
fi