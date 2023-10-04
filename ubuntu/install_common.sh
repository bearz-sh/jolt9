
if ! command -v "zoxide" &> /dev/null; then 
    sudo apt upgrade -y
    sudo apt install -y zip \
        ca-certificates \
        curl \
        apt-transport-https \
        lsb-release \
        gnupg \
        cifs-utils \
        wget \
        software-properties-common \
        bat \
        ripgrep \
        micro \
        unzip \
        net-tools \
        exa \
        age \
        mkcert \
        duff \
        btop \
        gh \
        neovim \
        tre-command \
        jq \
        zoxide \
        nnn 
fi

U=$USER
if [ ! -z "${SUDO_USER}" ]; then 
    U=$SUDO_USER
fi


if ! grep -q "#ZOXIDE" "/home/$U/.profile"; then
  echo '#ZOXIDE
eval "$(zoxide init bash --cmd jd)"' | tee -a /home/$U/.profile
    source /home/$U/.profile
fi

