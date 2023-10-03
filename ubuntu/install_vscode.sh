
DEST="/etc/apt/sources.list.d/vscode.list"
echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/vscode stable main" | sudo tee $DEST
sudo apt update -y

sudo apt install code -y