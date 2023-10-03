#!/bin/bash

if ! command -v "unzip" &> /dev/null; then 
    sudo apt upgrade -y
    sudo apt install unzip -y
fi

if ! command -v deno &> /dev/null; then 
    curl -fsSL https://deno.land/x/install/install.sh | sh
fi

if ! grep -q "# DENO" "/home/$USER/.profile"; then
   deno='# DENO
export DENO_INSTALL="/home/server_admin/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"
export DENO_TLS_CA_STORE="system"
'
    echo "$deno" | tee -a ~/.profile
    source ~/.profile
fi

