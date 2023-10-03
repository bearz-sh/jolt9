if ! command -v "oh-my-posh" &> /dev/null; then 
    curl -s https://ohmyposh.dev/install.sh | sudo bash -s
fi

oh-my-posh font install "Meslo"

mkdir -p ~/.config/omp
curl "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/bubblesextra.omp.json" | tee "~/.config/omp/bubblesextra.omp.json"

if ! grep -q "# OHMYPOSH" "/home/$USER/.profile"; then
    echo '# OHMYPOSH
eval "$(oh-my-posh init bash --config ~/.config/omp/bubblesextra.omp.json)"' | tee -a ~/.profile
fi