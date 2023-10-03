
function add_sudoer() {
    U=$USER
    if [ ! -z "${SUDO_USER}" ]; then 
        U=$SUDO_USER
    fi

    FILE="/etc/sudoers.d/$U"

    if [ ! -f "$FILE" ]; then 
        echo "sudoer file does not exist $FILE, creating"
        echo "$U ALL=(ALL) NOPASSWD:ALL" | sudo tee -a $FILE
    fi
}

add_sudoer()
