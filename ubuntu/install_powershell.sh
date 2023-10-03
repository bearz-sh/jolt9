#!/bin/bash

if ! grep -q "POWERSHELL_TELEMETRY_OPTOUT" "/etc/environment"; then
    echo "POWERSHELL_TELEMETRY_OPTOUT=1" | sudo tee -a /etc/environment
fi

if ! command -v pwsh &> /dev/null; then 
    source /etc/os-release
    echo $VERSION_ID

    wget -q https://packages.microsoft.com/config/ubuntu/$VERSION_ID/packages-microsoft-prod.deb

    # Register the Microsoft repository keys
    sudo dpkg -i packages-microsoft-prod.deb

    # Delete the the Microsoft repository keys file
    rm packages-microsoft-prod.deb
    sudo apt update -y
    sudo apt install powershell -y
fi