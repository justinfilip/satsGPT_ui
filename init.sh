# # # ONLY NEEDED IF RUNNING UI ON HOME COMPUTE SERVER # # #

# 

# 

# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# # # # CONTINUE # #

# #

# #

sudo cp /home/user/satsGPT_ui/ui_container.service /etc/systemd/system/ui_container.service
sudo chmod 744 /etc/systemd/system/ui_container.service
sudo systemctl enable ui_container.service

sudo chmod 744 /home/user/satsGPT_ui/auto_build_run_container.sh

cd /home/user/satsGPT_users/
sudo bash ./init.sh