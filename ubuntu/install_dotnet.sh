

function install_dotnet() {
    VERSION="7.0"

    if [ ! -z "${DOTNET_USER}" ]; then 
        $VERSION=$DOTNET_USER
    fi


    if ! grep -q "DOTNET_CLI_TELEMETRY_OPTOUT" "/etc/environment"; then
        echo "DOTNET_CLI_TELEMETRY_OPTOUT=1" | sudo tee -a /etc/environment
        source /etc/environment
    fi

    if [ ! -z dotnet ]; then 
        sudo apt install dotnet-sdk-$VERSION -y
    fi
}

install_dotnet