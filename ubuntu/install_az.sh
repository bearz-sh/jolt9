function install_az() {
    KEY="/etc/apt/keyrings/microsoft.gpg"
    URL=https://packages.microsoft.com/repos/azure-cli/
    DEST="/etc/apt/sources.list.d/azure-cli.list"
    AZ_DIST=$(lsb_release -cs)
    echo "deb [arch=`dpkg --print-architecture` signed-by=$KEY] $URL $AZ_DIST main" | sudo tee $DEST 
    sudo apt update -y
    sudo apt-get install azure-cli
}

install_az
