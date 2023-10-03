
function install_procs() {
    VERSION=$1

    if [ -z "${VERSION}" ]; then 
        VERSION="v0.14.0"
    fi

    echo "$VERSION"

    wget "https://github.com/dalance/procs/releases/download/$VERSION/procs-$VERSION-x86_64-linux.zip" -O ~/Downloads/procs.zip
    sudo unzip ~/Downloads/procs.zip -d /usr/local/bin
}

install_procs 


