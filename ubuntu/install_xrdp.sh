sudo apt install xrdp -y
sudo systemctl start xrdp
sudo systemctl enable xrdp
sudo usermod -a -G ssl-cert xrdp
sudo systemctl restart xrdp
sudo ufw allow 3389
sudo ufw reload 
ip addr